#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PREV="${1:-}"
if [[ -z "$PREV" ]]; then
  if [[ -f "$ROOT/.last-release-tag" ]]; then
    PREV="$(tr -d '\r\n' < "$ROOT/.last-release-tag")"
  else
    echo "Usage: $0 <image:tag>  or run local-release first (.last-release-tag)"
    exit 1
  fi
fi

echo "Rolling back: tagging $PREV as quiz-backend:local"
docker compose down
docker tag "$PREV" quiz-backend:local
docker compose up -d --no-build

sleep 3
bash "$ROOT/scripts/healthcheck.sh" "http://localhost:3000"
echo "Rollback smoke OK"
