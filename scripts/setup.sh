#!/usr/bin/env bash
# Smooth local setup. Run:  bash scripts/setup.sh
set -e
echo "📦 Installerer afhængigheder..."
npm install
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "📝 Oprettede .env.local — udfyld dine Firebase-nøgler i den fil."
fi
echo "✅ Klar. Kør:  npm run dev"
