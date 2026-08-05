#!/bin/bash

# ==============================================================================
# SCRIPT D'INSTALLATION DES TÂCHES PLANIFIÉES (CRON) — VPS KPSySchool
# À exécuter UNE SEULE FOIS sur le VPS en tant que root
# ==============================================================================
#
# UTILISATION :
#   chmod +x deploy/scripts/install-cron-vps.sh
#   bash deploy/scripts/install-cron-vps.sh
# ==============================================================================

set -euo pipefail

APP_DIR="/opt/kpsyschool"
SCRIPTS_DIR="${APP_DIR}/scripts"
LOG_DIR="/var/log/kpsyschool"

echo "============================================================"
echo "  Installation des tâches cron VPS KPSySchool"
echo "============================================================"

# 1. Créer les répertoires nécessaires
echo "[1/4] Création des répertoires..."
mkdir -p "$SCRIPTS_DIR" "$LOG_DIR"
chmod 750 "$SCRIPTS_DIR" "$LOG_DIR"

# 2. Copier les scripts depuis le dépôt vers l'emplacement d'exécution
echo "[2/4] Copie des scripts vers ${SCRIPTS_DIR}..."
cp "${APP_DIR}/deploy/scripts/cleanup-vps.sh" "${SCRIPTS_DIR}/cleanup-vps.sh"
cp "${APP_DIR}/deploy/scripts/backup-kpsyschool-postgres.sh" "${SCRIPTS_DIR}/backup-kpsyschool-postgres.sh"
chmod +x "${SCRIPTS_DIR}/cleanup-vps.sh"
chmod +x "${SCRIPTS_DIR}/backup-kpsyschool-postgres.sh"

# 3. Configurer la rotation des logs Docker globalement (si démon Docker disponible)
echo "[3/4] Configuration de la rotation des logs Docker (max 50MB, 3 fichiers)..."
DOCKER_DAEMON_CONFIG="/etc/docker/daemon.json"
if [ ! -f "$DOCKER_DAEMON_CONFIG" ]; then
  cat > "$DOCKER_DAEMON_CONFIG" << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
EOF
  echo "   ✅ daemon.json créé. Les nouveaux conteneurs utiliseront cette config."
  echo "   ⚠️  Redémarrer Docker pour appliquer : systemctl restart docker"
else
  echo "   ℹ️  daemon.json déjà présent — vérifiez manuellement que log-opts est configuré."
fi

# 4. Installer les entrées cron
echo "[4/4] Installation des tâches cron..."

# Lire les crons existants (sans planter si aucun n'existe)
CURRENT_CRON=$(crontab -l 2>/dev/null || true)

# Supprimer les anciennes entrées KPSySchool si présentes (pour éviter les doublons)
CLEAN_CRON=$(echo "$CURRENT_CRON" | grep -v "kpsyschool" || true)

# Définir les nouvelles tâches planifiées
NEW_CRON="${CLEAN_CRON}
# ── KPSySchool : Nettoyage VPS (dimanche 3h00) ──────────────────────────────
0 3 * * 0 ${SCRIPTS_DIR}/cleanup-vps.sh >> ${LOG_DIR}/cleanup.log 2>&1
# ── KPSySchool : Sauvegarde PostgreSQL (chaque jour 2h00) ───────────────────
# Note: Le backup cron Docker tourne déjà depuis le conteneur kpsyschool_backup
# Cette ligne est en commentaire pour ne pas doubler la sauvegarde.
# 0 2 * * * docker exec kpsyschool_backup /backup.sh >> ${LOG_DIR}/backup.log 2>&1
"

# Installer le nouveau crontab
echo "$NEW_CRON" | crontab -

echo ""
echo "============================================================"
echo "  ✅ Installation terminée ! Tâches planifiées actives :"
echo "============================================================"
crontab -l | grep -v "^#" | grep -v "^$" || echo "  (Aucune tâche active visible)"
echo ""
echo "  📄 Logs disponibles dans : ${LOG_DIR}/"
echo "  🔍 Vérifier : crontab -l"
echo "============================================================"
