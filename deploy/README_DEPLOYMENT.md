# 🚀 Guide de Déploiement & Cohabitation VPS : KPSyDesk + KPsySchool

Ce document récapitule les procédures opérationnelles pour la cohabitation des deux applications SaaS sur le même VPS Hostinger (4 Go RAM).

---

## 📌 1. Récapitulatif des Noms de Domaine & Ports

| Application | Domaine Principal | Port Interne | Réseau Docker | Base PostgreSQL |
| :--- | :--- | :---: | :--- | :--- |
| **KPSyDesk (ITAM Prod)** | `app.kpsyinformatique.com` | `127.0.0.1:8080` | `itam_net` | `itam_postgres` (Port 5432) |
| **KPsySchool (Gestion Scolaire)** | `school.kpsyinformatique.com` | `127.0.0.1:8090` (UI)<br>`127.0.0.1:8091` (API) | `kpsyschool_net` | `kpsyschool_postgres` (Port 5432) |

---

## 📁 2. Emplacements des Fichiers sur le VPS

* **Reverse Proxy Frontal Nginx** : `/etc/nginx/sites-available/kpsyschool.conf` (lié vers `/etc/nginx/sites-enabled/`)
* **KPSyDesk (ITAM existant)** : `/opt/kpsydesk/` (Non touché)
* **KPsySchool (Nouvelle App)** : `/opt/kpsyschool/`
  * `docker-compose.yml`
  * `scripts/backup-kpsyschool-postgres.sh`

---

## ⚡ 3. Procédure Étape par Étape pour l'Administrateur VPS

### Étape 1 : Vérification & Activation du Fichier SWAP (2 Go)
```bash
# Vérifier la présence d'un swap
swapon --show

# Si aucun swap n'est affiché, exécuter :
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Permanent au redémarrage
echo '/swapfile none swap defaults 0 0' | sudo tee -a /etc/fstab
```

### Étape 2 : Installation du Reverse Proxy Nginx Frontal
```bash
# Copier la configuration Nginx
sudo cp deploy/nginx/kpsyschool.conf /etc/nginx/sites-available/kpsyschool.conf
sudo ln -s /etc/nginx/sites-available/kpsyschool.conf /etc/nginx/sites-enabled/

# Certificats SSL Let's Encrypt séparés
sudo certbot --nginx -d app.kpsyinformatique.com -d school.kpsyinformatique.com

# Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Étape 3 : Démarrage de KPsySchool sans toucher à KPSyDesk
```bash
cd /opt/kpsyschool
docker compose up -d --build
```

---

## 🔄 4. Redémarrage / Mise à Jour Indépendante

Pour mettre à jour ou redémarrer **KPsySchool** sans **jamais impacter KPSyDesk** :
```bash
cd /opt/kpsyschool
docker compose restart
# Ou pour reconstruire :
docker compose up -d --build --no-deps kpsyschool_backend
```

---

## 🧪 5. Tests de Validation & d'Isolation Réseau

### A. Test d'Isolation Réseau Docker (Étanchéité)
```bash
# Tenter de joindre la base KPSyDesk depuis le conteneur KPsySchool (Doit ÉCHOUER)
docker exec -it kpsyschool_backend ping -c 2 itam_postgres
# Résultat attendu : ping: bad address 'itam_postgres' ou Host unreachable
```

### B. Test de Sauvegarde Autonome
```bash
# Exécuter manuellement la sauvegarde KPsySchool
docker exec -it kpsyschool_backup /backup.sh

# Lister les backups générés
docker exec -it kpsyschool_backup ls -lh /backups
```

### C. Test de Non-Régression sur KPSyDesk
```bash
# Vérifier l'état et la RAM de KPSyDesk
docker stats itam_postgres itam_backend itam_frontend --no-stream
curl -I https://app.kpsyinformatique.com
```
