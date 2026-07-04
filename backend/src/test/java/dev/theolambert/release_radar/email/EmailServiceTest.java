package dev.theolambert.release_radar.email;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.release.Release;
import dev.theolambert.release_radar.release.ReleaseType;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@test.com");
    }

    @Test
    void escapesHtmlInArtistNameAndReleaseTitle() throws Exception {
        Artist artist = new Artist();
        artist.setId(UUID.randomUUID());
        artist.setName("<script>alert(1)</script>");

        Release release = new Release();
        release.setTitle("<img src=x onerror=alert(2)>");
        release.setType(ReleaseType.ALBUM);
        release.setReleaseDate(LocalDate.now());

        User subscriber = new User();
        subscriber.setEmail("fan@test.com");

        when(userRepository.findSubscribersByArtistId(artist.getId()))
                .thenReturn(List.of(subscriber));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        emailService.notifySubscribers(artist, List.of(release));

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        String html = (String) captor.getValue().getContent();

        assertThat(html).contains("&lt;script&gt;");
        assertThat(html).doesNotContain("<script>");
        assertThat(html).contains("&lt;img src=x");
        assertThat(html).doesNotContain("<img src=x onerror");
    }

    @Test
    void doesNothingWhenNoReleases() {
        emailService.notifySubscribers(new Artist(), List.of());
        verifyNoInteractions(mailSender, userRepository);
    }

    @Test
    void doesNothingWhenNoSubscribers() {
        Artist artist = new Artist();
        artist.setId(UUID.randomUUID());
        artist.setName("Sub Focus");

        Release release = new Release();
        release.setTitle("New Track");
        release.setType(ReleaseType.SINGLE);

        when(userRepository.findSubscribersByArtistId(artist.getId())).thenReturn(List.of());

        emailService.notifySubscribers(artist, List.of(release));

        verifyNoInteractions(mailSender);
    }
}
