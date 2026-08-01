#!/bin/sh

# ==============================================================================
# SCRIPT DE SAUVEGARDE POSTGRESQL AUTONOME POUR KPYSCHOOL
# ==============================================================================

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/kpsyschool_db_${TIMESTAMP}.sql.gz"

echo "[$(date)] Début de la sauvegarde de la base KPsySchool..."

# Dump chiffré/compressé
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "[$(date)] Sauvegarde réussie : ${BACKUP_FILE}"
else
    echo "[$(date)] ERREUR lors de la sauvegarde !"
    exit 1
fi

# Purge des sauvegardes de plus de 30 jours
echo "[$(date)] Purge des anciennes sauvegardes (>30 jours)..."
find "${BACKUP_DIR}" -type f -name "kpsyschool_db_*.sql.gz" -mtime +30 -exec rm -f {} \;
echo "[$(date)] Nettoyage terminé."
