#!/bin/bash
# 重新建置並發佈：有設定 git remote 才會推上線，沒有就只建置＋本機 commit
set -e
cd "$(dirname "$0")/.."
node --check src/news-data.js
node --check src/posts-data.js
node src/build.cjs
git add -A
if git diff --cached --quiet; then echo "no changes"; exit 0; fi
git commit -q -m "${1:-update: $(date +%F)}"
if git remote get-url origin >/dev/null 2>&1; then git push -q origin HEAD && echo "pushed"; else echo "committed locally (no remote yet)"; fi
