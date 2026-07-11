#!/bin/sh
set -e

# Change directory to backend
cd /app/backend

echo "Running database schema migrations / push..."
npx drizzle-kit push:pg --config=drizzle.config.ts

echo "Starting VellVista backend server..."
exec npm start
