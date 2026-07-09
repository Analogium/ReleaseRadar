package dev.theolambert.release_radar.security;

import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingServiceTest {

    @Test
    void allowsUpToCapacityThenBlocks() {
        RateLimitingService service = new RateLimitingService(3, 1);

        assertThat(service.tryConsume("1.2.3.4").isConsumed()).isTrue();
        assertThat(service.tryConsume("1.2.3.4").isConsumed()).isTrue();
        assertThat(service.tryConsume("1.2.3.4").isConsumed()).isTrue();

        ConsumptionProbe blocked = service.tryConsume("1.2.3.4");
        assertThat(blocked.isConsumed()).isFalse();
        assertThat(blocked.getNanosToWaitForRefill()).isPositive();
    }

    @Test
    void keysAreTrackedIndependently() {
        RateLimitingService service = new RateLimitingService(1, 1);

        assertThat(service.tryConsume("10.0.0.1").isConsumed()).isTrue();
        assertThat(service.tryConsume("10.0.0.1").isConsumed()).isFalse();

        // Une autre clé (IP) dispose de son propre quota, intact.
        assertThat(service.tryConsume("10.0.0.2").isConsumed()).isTrue();
    }
}
