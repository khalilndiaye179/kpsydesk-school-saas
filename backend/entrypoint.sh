#!/bin/sh
set -e

echo "[KPsySchool Backend] Execution des migrations Prisma SQL..."
npx prisma migrate deploy || {
  echo "[KPsySchool Backend] ERREUR CRITIQUE : Echec de 'npx prisma migrate deploy'. Arret du conteneur."
  exit 1
}

echo "[KPsySchool Backend] Demarrage du serveur NestJS en production..."
if [ -f "dist/src/main.js" ]; then
  exec node dist/src/main.js
else
  exec node dist/main.js
fi
