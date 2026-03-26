#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3000}"
code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/health")"
if [[ "$code" != "200" ]]; then
  echo "healthcheck failed: expected 200, got ${code}"
  exit 1
fi
echo "health OK (${BASE}/health)"
