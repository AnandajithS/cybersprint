#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Building CyberSprint..."
echo

echo "📍 Building frontend..."
cd "$ROOT/frontend"
npm run build >/dev/null 2>&1
echo "  ✓ Frontend built (frontend/dist)"

echo "📍 Building backend..."
cd "$ROOT/backend"
go build -o cybersprint-server .
echo "  ✓ Backend built (backend/cybersprint-server)"

echo
echo "✅ Build complete!"
echo
echo "Run with:"
echo "  cd $ROOT/backend && ./cybersprint-server"
echo "  (or)  PORT=8080 ./backend/cybersprint-server"
echo
echo "Then open http://localhost:8080 in a browser."
