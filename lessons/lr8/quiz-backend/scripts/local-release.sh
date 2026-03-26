#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TAG="${1:-quiz-backend:local-$(date +%Y%m%d-%H%M%S)}"
echo "Building image: $TAG (+ quiz-backend:local)"
docker build -t "$TAG" -t quiz-backend:local .

echo "Starting stack (compose, no rebuild)..."
docker compose up -d --no-build

echo "Waiting for backend..."
for i in $(seq 1 30); do
  if curl -sf "http://localhost:3000/health" >/dev/null; then
    break
  fi
  sleep 1
done

bash "$ROOT/scripts/healthcheck.sh" "http://localhost:3000"
code="$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/admin/questions")"
echo "Smoke: GET /api/admin/questions (unauthorized) HTTP ${code}"
if [[ "$code" != "401" ]]; then
  echo "expected 401 without Bearer token"
  exit 1
fi

echo "Local release done. Image tag: $TAG"
echo "$TAG" > "$ROOT/.last-release-tag"
