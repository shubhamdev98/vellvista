#!/bin/sh
set -e

# Change directory to backend workspace
cd /app/backend

if [ -f "./node_modules/drizzle-kit/bin.cjs" ]; then
  echo "Running database schema migrations..."
  printf "\n\n\n\n" | node ./node_modules/drizzle-kit/bin.cjs push:pg --config=drizzle.config.ts || true
fi

echo "Starting VellVista backend server..."
exec node dist/index.js


