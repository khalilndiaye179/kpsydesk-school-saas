#!/bin/sh
set -e

echo "[KPsySchool Backend] Application des migrations Prisma sur PostgreSQL..."
npx prisma db push --accept-data-loss || npx prisma migrate deploy || {
  echo "[KPsySchool Backend] AVERTISSEMENT : Échec de synchronisation Prisma DB, poursuite du démarrage..."
}

echo "[KPsySchool Backend] Démarrage du serveur NestJS en production..."
if [ -f "dist/src/main.js" ]; then
  exec node dist/src/main.js
else
  exec node dist/main.js
fi
