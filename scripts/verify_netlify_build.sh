#!/usr/bin/env bash
# Verify that the built frontend contains the expected VITE_API_BASE_URL
if [ -z "$1" ]; then
  echo "Usage: $0 <expected-api-base-url>"
  exit 2
fi
EXPECTED="$1"
if grep -R --line-number --fixed-strings "$EXPECTED" frontend/dist >/dev/null; then
  echo "Found expected API base URL in build: $EXPECTED"
  exit 0
else
  echo "Expected API base URL not found in build: $EXPECTED"
  exit 1
fi
