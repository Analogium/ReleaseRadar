#!/usr/bin/env bash
#
# Runs the full Release Radar test suite (unit + Testcontainers integration).
#
# Integration tests (@SpringBootTest) spin up a real PostgreSQL container via
# Testcontainers, so Docker must be running. Any extra arguments are passed
# straight through to Maven.
#
# Usage:
#   ./run-tests.sh                     # full suite
#   ./run-tests.sh -Dtest=JwtServiceTest
#   ./run-tests.sh --skip-integration  # fast unit tests only (no Docker needed)

set -euo pipefail

cd "$(dirname "$0")"

SKIP_INTEGRATION=false
MVN_ARGS=()
for arg in "$@"; do
    case "$arg" in
        --skip-integration) SKIP_INTEGRATION=true ;;
        *) MVN_ARGS+=("$arg") ;;
    esac
done

# Integration tests need a running Docker daemon for Testcontainers.
if [ "$SKIP_INTEGRATION" = false ]; then
    if ! docker info >/dev/null 2>&1; then
        echo "[X] Docker is not running. Start Docker, or pass --skip-integration for unit tests only." >&2
        exit 1
    fi
    echo "[OK] Docker is running."
fi

if [ "$SKIP_INTEGRATION" = true ]; then
    # Exclude the tests that boot a Spring context / container.
    MVN_ARGS+=("-Dtest=!*IntegrationTest,!*ApplicationTests,!AdminAuthorizationTest")
fi

echo "Running: ./mvnw test ${MVN_ARGS[*]:-}"
if ./mvnw test "${MVN_ARGS[@]}"; then
    echo ""
    echo "[OK] All tests passed."
else
    status=$?
    echo ""
    echo "[X] Tests failed (see target/surefire-reports)." >&2
    exit $status
fi
