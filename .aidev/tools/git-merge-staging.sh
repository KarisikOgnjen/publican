#!/bin/bash
STAGING=${1:?Usage: git-merge-staging.sh <staging-branch>}
echo "=== Merging origin/$STAGING into current branch ==="
git fetch origin
git merge origin/$STAGING
if [ $? -ne 0 ]; then
  echo "Conflicts detected — resolve them manually, then run: git add . && git commit --no-edit"
  exit 1
fi
echo "=== Merge complete ==="
