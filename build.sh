#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Building CyberSprint..."
echo

echo "📍 Building frontend..."
cd "$ROOT/frontend"
npm run build >/dev/null 2>&1
echo "  ✓ Frontend built (frontend/dist)"

echo
echo "✅ Build complete!"
echo
echo "Preview locally with:"
echo "  cd $ROOT/frontend && npm run preview"
echo
echo "To deploy to Vercel, see README.md"