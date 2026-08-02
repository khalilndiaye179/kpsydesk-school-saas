#!/bin/sh
set -e

echo "[KPsySchool Backend] Application des migrations Prisma sur PostgreSQL..."
npx prisma db push --accept-data-loss || npx prisma migrate deploy || {
  echo "[KPsySchool Backend] AVERTISSEMENT : Échec de synchronisation Prisma DB, poursuite du démarrage..."
}

echo "[KPsySchool Backend] Démarrage du serveur NestJS en production..."
exec node dist/main.js
