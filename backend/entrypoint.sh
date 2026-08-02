#!/bin/sh
set -e

echo "[KPsySchool Backend] Application des migrations Prisma sur PostgreSQL..."
npx prisma migrate deploy || {
  echo "[KPsySchool Backend] ERREUR : Échec de l'application des migrations Prisma !"
  exit 1
}

echo "[KPsySchool Backend] Démarrage du serveur NestJS en production..."
exec node dist/main.js
