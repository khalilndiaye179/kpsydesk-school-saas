#!/bin/sh
# ============================================================
# backup-kpsyschool-postgres.sh
# Sauvegarde automatique PostgreSQL — KPSyDesk School SaaS
# Exécuté chaque nuit à 02h00 via cron dans kpsyschool_backup
# Rétention : 30 jours
# ============================================================

set -e

BACKUP_DIR="/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DIR}/school_backup_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Démarrage sauvegarde KPSySchool DB : ${POSTGRES_DB}..." | tee -a "${LOG_FILE}"

# Vérification des variables d'environnement
if [ -z "${POSTGRES_USER}" ] || [ -z "${POSTGRES_PASSWORD}" ] || [ -z "${POSTGRES_DB}" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Variables manquantes (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)." | tee -a "${LOG_FILE}"
  exit 1
fi

# Dump compressé à la volée
export PGPASSWORD="${POSTGRES_PASSWORD}"
if pg_dump -h "${POSTGRES_HOST:-kpsyschool_postgres}" \
           -U "${POSTGRES_USER}" \
           -d "${POSTGRES_DB}" \
           -F p | gzip > "${FILENAME}"; then
  SIZE=$(du -sh "${FILENAME}" | cut -f1)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Sauvegarde réussie : ${FILENAME} (${SIZE})" | tee -a "${LOG_FILE}"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Échec de la sauvegarde pg_dump." | tee -a "${LOG_FILE}"
  exit 1
fi

# Nettoyage des sauvegardes anciennes (> 30 jours)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 Nettoyage des sauvegardes de plus de ${RETENTION_DAYS} jours..." | tee -a "${LOG_FILE}"
deleted_count=0
for f in $(find "${BACKUP_DIR}" -name "school_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS}); do
  rm -f "$f"
  echo "  - Supprimé : $f" | tee -a "${LOG_FILE}"
  deleted_count=$((deleted_count + 1))
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✨ Sauvegarde terminée. Fichiers supprimés : ${deleted_count}." | tee -a "${LOG_FILE}"
echo "--------------------------------------------------------" >> "${LOG_FILE}"
