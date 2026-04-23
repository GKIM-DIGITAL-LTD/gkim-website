#!/bin/bash

set -e

# Move to project root (works wherever you call the script from)
cd "$(dirname "$0")"

echo "==> Checking for changes..."
if [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to commit. Already up to date."
  exit 0
fi

# Accept a commit message as an argument, or prompt for one
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
else
  echo -n "Enter commit message (or press Enter for auto-message): "
  read COMMIT_MSG
  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
  fi
fi

echo "==> Staging all changes..."
git add -A

echo "==> Committing: \"$COMMIT_MSG\""
git commit -m "$COMMIT_MSG"

echo "==> Pushing to main..."
git push origin main

echo ""
echo "Done! Vercel will auto-deploy in ~30 seconds."
