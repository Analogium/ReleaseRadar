package dev.theolambert.release_radar.email;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.release.Release;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${mail.from}")
    private String fromAddress;

    public void notifySubscribers(Artist artist, List<Release> newReleases) {
        if (newReleases.isEmpty()) return;

        List<User> subscribers = userRepository.findSubscribersByArtistId(artist.getId());
        if (subscribers.isEmpty()) return;

        String subject = "New release from " + artist.getName();
        String body = buildEmailBody(artist, newReleases);

        for (User subscriber : subscribers) {
            try {
                sendHtmlEmail(subscriber.getEmail(), subject, body);
                log.info("Notification sent to {} for {}", subscriber.getEmail(), artist.getName());
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", subscriber.getEmail(), e.getMessage());
            }
        }
    }

    public void sendTestEmail(String to) {
        try {
            sendHtmlEmail(to, "Release Radar — test email",
                    "<html><body><h2>✅ Release Radar SMTP works!</h2><p>Your Brevo configuration is correct.</p></body></html>");
            log.info("Test email sent to {}", to);
        } catch (Exception e) {
            log.error("Test email failed: {}", e.getMessage());
            throw new RuntimeException("Failed to send test email: " + e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        var message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private String buildEmailBody(Artist artist, List<Release> releases) {
        var sb = new StringBuilder();
        sb.append("<html><body style='font-family: sans-serif; color: #222;'>");
        sb.append("<h2>🎵 New release").append(releases.size() > 1 ? "s" : "").append(" from ").append(artist.getName()).append("</h2>");
        sb.append("<ul>");
        for (Release r : releases) {
            sb.append("<li>");
            sb.append("<strong>").append(r.getTitle()).append("</strong>");
            sb.append(" <span style='color:#888'>(").append(r.getType()).append(")</span>");
            if (r.getReleaseDate() != null) {
                sb.append(" — ").append(r.getReleaseDate());
            }
            sb.append("</li>");
        }
        sb.append("</ul>");
        sb.append("<p style='color:#aaa;font-size:12px'>Release Radar — unsubscribe by removing the artist from your dashboard.</p>");
        sb.append("</body></html>");
        return sb.toString();
    }
}
