#!/bin/bash
# =============================================================================
# SCRIPT DE DÉPLOIEMENT KPSYSCHOOL — Hotfix MFA + Login SuperAdmin
# À exécuter sur le VPS dans /opt/kpsyschool
# =============================================================================

set -e

echo "🔄 [1/5] Pull des derniers changements Git..."
git pull origin main

echo "🔐 [2/5] Vérification de la variable MFA_ENCRYPTION_KEY..."
if ! grep -q "MFA_ENCRYPTION_KEY" .env; then
  echo 'MFA_ENCRYPTION_KEY="kpsyschool_mfa_aes256gcm_key_change_this_in_prod!"' >> .env
  echo "  → MFA_ENCRYPTION_KEY ajoutée au .env"
else
  echo "  → MFA_ENCRYPTION_KEY déjà présente"
fi

echo "🐳 [3/5] Rebuild du backend (MFA endpoints + fix login)..."
docker compose up -d --build --no-deps kpsyschool_backend

echo "🐳 [4/5] Rebuild du frontend (fix PasswordStep)..."
docker compose up -d --build --no-deps kpsyschool_frontend

echo "⏳ Attente du démarrage backend (15s)..."
sleep 15

echo "🧪 [5/5] Test de la route de connexion SuperAdmin..."
RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  https://school.kpsyinformatique.com/api/v1/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","pass":"wrongpass"}')

if [ "$RESULT" = "401" ]; then
  echo "✅ Backend OK — Route /platform/auth/login répond 401 (attendu)"
elif [ "$RESULT" = "404" ]; then
  echo "❌ ERREUR : 404 — Nginx proxy_pass toujours mal configuré"
else
  echo "⚠️  Réponse HTTP : $RESULT"
fi

echo ""
echo "========================================"
echo "✅ Déploiement terminé."
echo "URL : https://school.kpsyinformatique.com/login"
echo "Email   : neguinho.ndiaye@gmail.com"
echo "Password: Neguinho179@#@"
echo "Rôle    : ADMINISTRATEUR (pilule à sélectionner)"
echo "========================================"
