#!/usr/bin/env bash

if [ -n "${ZSH_EVAL_CONTEXT:-}" ]; then
    case "$ZSH_EVAL_CONTEXT" in
        *:file)
            echo "Do not use 'source' for this script. Run: bash scripts/build-and-deploy-theme.sh <server-host-or-ip>" >&2
            return 1
            ;;
    esac
fi

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]:-}" != "$0" ]; then
    echo "Do not use 'source' for this script. Run: bash scripts/build-and-deploy-theme.sh <server-host-or-ip>" >&2
    return 1 2>/dev/null || exit 1
fi

set -euo pipefail

finish() {
    status=$?

    echo ""

    if [ "$status" -eq 0 ]; then
        echo "Script finished successfully."
    else
        echo "Script stopped with exit code $status."
        echo "Check the message above to see which step failed."
    fi

    if [ -t 0 ] && [ "${KEEP_OPEN:-1}" = "1" ]; then
        read -r -p "Press Enter to close..."
    fi
}

trap finish EXIT

# Set your default server host or IP here.
# Example:
DEFAULT_SERVER="34.21.175.248"
# DEFAULT_SERVER="keycloak"

SERVER="${1:-$DEFAULT_SERVER}"
SSH_USER="alexkgm2412"
JAR_NAME="keycloak-theme-for-kc-all-other-versions.jar"
REMOTE_HOME="/home/${SSH_USER}"
CONTAINER_NAME="keycloak"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$SERVER" ]; then
    echo "Set DEFAULT_SERVER in scripts/build-and-deploy-theme.sh or pass <server-host-or-ip>." >&2
    exit 1
fi

cd "$ROOT_DIR"

echo "Cleaning old local build output..."
rm -rf dist dist_keycloak

echo "Building fresh Keycloak theme..."
yarn build-keycloak-theme

echo "Removing old uploaded jar from server home..."
ssh "${SSH_USER}@${SERVER}" "rm -f '${REMOTE_HOME}/${JAR_NAME}'"

echo "Copying fresh jar to server..."
scp "dist_keycloak/${JAR_NAME}" "${SSH_USER}@${SERVER}:${REMOTE_HOME}/"

echo "Removing old jar from Keycloak container..."
ssh "${SSH_USER}@${SERVER}" "docker exec -u 0 '${CONTAINER_NAME}' rm -f '/opt/keycloak/providers/${JAR_NAME}'"

echo "Copying fresh jar into Keycloak container..."
ssh "${SSH_USER}@${SERVER}" "docker cp '${REMOTE_HOME}/${JAR_NAME}' '${CONTAINER_NAME}:/opt/keycloak/providers/'"

echo "Building Keycloak..."
ssh "${SSH_USER}@${SERVER}" "docker exec '${CONTAINER_NAME}' /opt/keycloak/bin/kc.sh build"

echo "Restarting Keycloak..."
ssh "${SSH_USER}@${SERVER}" "docker restart '${CONTAINER_NAME}'"

echo ""
echo "Done."
echo "Next step in Keycloak Admin:"
echo "Realm Settings -> Themes -> Login Theme -> keycloakify-starter"
