#!/usr/bin/env bash

if [ -n "${ZSH_EVAL_CONTEXT:-}" ]; then
    case "$ZSH_EVAL_CONTEXT" in
        *:file)
            echo "Do not use 'source' for this script. Run: bash push.sh [commit message]" >&2
            return 1
            ;;
    esac
fi

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]:-}" != "$0" ]; then
    echo "Do not use 'source' for this script. Run: bash push.sh [commit message]" >&2
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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "This folder is not a git repository." >&2
    exit 1
fi

BRANCH="$(git branch --show-current)"

if [ -z "$BRANCH" ]; then
    echo "Could not detect the current git branch." >&2
    exit 1
fi

COMMIT_MESSAGE="${*:-chore: update $(date '+%Y-%m-%d %H:%M:%S')}"

echo "Staging changes..."
git add -A

if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

echo "Creating commit..."
git commit -m "$COMMIT_MESSAGE"

echo "Pushing branch '$BRANCH'..."
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    git push
else
    git push -u origin "$BRANCH"
fi

echo ""
echo "Done."
