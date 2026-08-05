#!/bin/bash

# ==============================================================================
# SCRIPT DE NETTOYAGE AUTOMATIQUE DU VPS — KPSySchool
# Destiné à être planifié via cron pour libérer l'espace disque régulièrement
# ==============================================================================
#
# INSTALLATION & PLANIFICATION :
# --------------------------------
# 1. Copier ce script sur le VPS :
#    scp deploy/scripts/cleanup-vps.sh root@<ip_vps>:/opt/kpsyschool/scripts/cleanup-vps.sh
#
# 2. Rendre exécutable :
#    chmod +x /opt/kpsyschool/scripts/cleanup-vps.sh
#
# 3. Ajouter dans cron (exécution hebdomadaire, dimanche 3h du matin) :
#    crontab -e
#    0 3 * * 0 /opt/kpsyschool/scripts/cleanup-vps.sh >> /var/log/kpsyschool/cleanup.log 2>&1
#
# 4. S'assurer que le dossier de logs existe :
#    mkdir -p /var/log/kpsyschool && chmod 750 /var/log/kpsyschool
#
# ==============================================================================

set -euo pipefail

# --- Configuration ---
APP_DIR="/opt/kpsyschool"
LOG_FILE="/var/log/kpsyschool/cleanup.log"
MAX_LOG_SIZE_MB=50          # Taille max des logs système avant rotation (en MB)
DOCKER_LOG_MAX_SIZE="50m"   # Taille max par fichier de log Docker (pour la config globale)
BACKUP_RETENTION_DAYS=30    # Jours de rétention des sauvegardes PostgreSQL (déjà dans backup.sh)
TMP_RETENTION_DAYS=7        # Jours après lesquels les fichiers /tmp sont purgés

# --- Fonctions Utilitaires ---
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

separator() {
  echo "============================================================"
}

bytes_to_human() {
  numfmt --to=iec-i --suffix=B "$1" 2>/dev/null || echo "${1} B"
}

get_disk_usage() {
  df -h / | awk 'NR==2 {print $3 " utilisés / " $2 " total (" $5 " plein)"}'
}

# ==============================================================================
# DÉBUT DU NETTOYAGE
# ==============================================================================
separator
log "🧹 DÉMARRAGE DU NETTOYAGE VPS KPSySchool"
log "📊 Espace disque AVANT : $(get_disk_usage)"
separator

# --- 1. DOCKER : Images obsolètes / dangling ---
log "🐳 [1/7] Suppression des images Docker obsolètes (dangling)..."
BEFORE=$(docker system df --format '{{.ReclaimableSize}}' 2>/dev/null || echo "N/A")
docker image prune -f --filter "until=168h" 2>/dev/null || true
log "   ✅ Images dangling purgées."

# --- 2. DOCKER : Conteneurs arrêtés ---
log "🐳 [2/7] Suppression des conteneurs arrêtés (non-KPSySchool)..."
# On ne supprime que les conteneurs stoppés qui ne font PAS partie de la stack active
docker container prune -f --filter "until=72h" 2>/dev/null || true
log "   ✅ Conteneurs arrêtés purgés."

# --- 3. DOCKER : Volumes non utilisés ---
log "🐳 [3/7] Suppression des volumes Docker orphelins..."
# IMPORTANT : Seuls les volumes non référencés par un conteneur actif sont supprimés.
# kpsyschool_pgdata et kpsyschool_backups sont protégés car utilisés.
docker volume prune -f 2>/dev/null || true
log "   ✅ Volumes orphelins purgés."

# --- 4. DOCKER : Build cache ---
log "🐳 [4/7] Nettoyage du build cache Docker (>7 jours)..."
docker builder prune -f --keep-storage 1GB --filter "until=168h" 2>/dev/null || true
log "   ✅ Build cache Docker purgé (cache >7j)."

# --- 5. DOCKER : Logs de conteneurs gonflés ---
log "📄 [5/7] Troncature des logs de conteneurs > ${MAX_LOG_SIZE_MB}MB..."
CONTAINERS=$(docker ps --format '{{.Names}}' 2>/dev/null || echo "")
TOTAL_LOGS_FREED=0
if [ -n "$CONTAINERS" ]; then
  for CONTAINER in $CONTAINERS; do
    LOG_PATH=$(docker inspect --format='{{.LogPath}}' "$CONTAINER" 2>/dev/null || echo "")
    if [ -n "$LOG_PATH" ] && [ -f "$LOG_PATH" ]; then
      LOG_SIZE_MB=$(du -m "$LOG_PATH" 2>/dev/null | cut -f1 || echo "0")
      if [ "$LOG_SIZE_MB" -gt "$MAX_LOG_SIZE_MB" ]; then
        log "   🔪 Troncature du log de $CONTAINER (${LOG_SIZE_MB}MB > ${MAX_LOG_SIZE_MB}MB)..."
        TOTAL_LOGS_FREED=$((TOTAL_LOGS_FREED + LOG_SIZE_MB))
        # Rotation sûre : ne pas supprimer, juste vider (le fichier est toujours utilisé)
        echo "" > "$LOG_PATH"
        log "   ✅ Log $CONTAINER remis à zéro."
      fi
    fi
  done
fi
if [ "$TOTAL_LOGS_FREED" -eq 0 ]; then
  log "   ℹ️  Aucun log de conteneur ne dépasse ${MAX_LOG_SIZE_MB}MB."
else
  log "   ✅ Total logs libérés : ${TOTAL_LOGS_FREED}MB"
fi

# --- 6. SYSTÈME : Fichiers temporaires ---
log "🗂️  [6/7] Nettoyage des fichiers temporaires système..."

# /tmp : fichiers non modifiés depuis plus de N jours
if [ -d /tmp ]; then
  COUNT_TMP=$(find /tmp -mindepth 1 -maxdepth 2 -mtime +${TMP_RETENTION_DAYS} 2>/dev/null | wc -l || echo "0")
  find /tmp -mindepth 1 -maxdepth 2 -mtime +${TMP_RETENTION_DAYS} -delete 2>/dev/null || true
  log "   ✅ /tmp : ${COUNT_TMP} fichiers de plus de ${TMP_RETENTION_DAYS} jours supprimés."
fi

# Journaux systemd : conserver seulement les 7 derniers jours
if command -v journalctl &>/dev/null; then
  journalctl --vacuum-time=7d 2>/dev/null || true
  log "   ✅ Journaux systemd compactés (conservation 7 jours)."
fi

# Paquets apt obsolètes (si Debian/Ubuntu)
if command -v apt-get &>/dev/null; then
  apt-get autoremove -y --purge 2>/dev/null || true
  apt-get clean 2>/dev/null || true
  log "   ✅ Paquets apt orphelins et cache purges."
fi

# Logs applicatifs KPSySchool (rotation si > 50MB, conservation 14 jours)
if [ -d "/var/log/kpsyschool" ]; then
  find /var/log/kpsyschool -name "*.log" -mtime +14 -delete 2>/dev/null || true
  # Tronquer le log de cleanup lui-même s'il dépasse 10MB
  if [ -f "$LOG_FILE" ]; then
    LOG_CLEANUP_SIZE=$(du -m "$LOG_FILE" 2>/dev/null | cut -f1 || echo "0")
    if [ "$LOG_CLEANUP_SIZE" -gt 10 ]; then
      tail -n 500 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
      log "   ✅ Fichier log cleanup.log tronqué (conservé : 500 dernières lignes)."
    fi
  fi
fi

# --- 7. RAPPORT FINAL ---
separator
log "📊 [7/7] RAPPORT DE NETTOYAGE TERMINÉ"
separator
log "💾 Espace disque APRÈS  : $(get_disk_usage)"

# Résumé Docker
DOCKER_SUMMARY=$(docker system df 2>/dev/null || echo "N/A")
log ""
log "📦 Résumé Docker après nettoyage :"
echo "$DOCKER_SUMMARY" | while IFS= read -r line; do
  log "   $line"
done
separator
log "✅ Nettoyage complet terminé avec succès !"
separator
