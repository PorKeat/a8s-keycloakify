#!/usr/bin/env bash

if [ -n "${ZSH_EVAL_CONTEXT:-}" ]; then
    case "$ZSH_EVAL_CONTEXT" in
        *:file)
            echo "Do not use 'source' for this script. Run: bash scripts/rebuild-theme.sh" >&2
            return 1
            ;;
    esac
fi

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]:-}" != "$0" ]; then
    echo "Do not use 'source' for this script. Run: bash scripts/rebuild-theme.sh" >&2
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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Cleaning old build output..."
rm -rf dist dist_keycloak

echo "Building fresh Keycloak theme..."
yarn build-keycloak-theme

echo ""
echo "Done."
echo "New files are in:"
echo "  $ROOT_DIR/dist"
echo "  $ROOT_DIR/dist_keycloak"
