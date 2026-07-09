package dev.theolambert.release_radar;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class for tests that need a real database.
 * Wires the datasource to a PostgreSQL container via {@link ServiceConnection};
 * Flyway migrations run against it.
 *
 * <p>Conteneur <strong>singleton</strong> : démarré une seule fois (bloc statique) et
 * jamais arrêté entre les classes. On n'utilise pas {@code @Testcontainers}, qui
 * arrêterait le conteneur après chaque classe — un contexte Spring mis en cache puis
 * réutilisé par une classe suivante se retrouverait alors branché sur une base morte.
 */
@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:17");

    static {
        POSTGRES.start();
    }
}
