# ==============================================================================
# DOCKERFILE MULTI-STAGE — FRONTEND REACT/VITE (KPSYSCHOOL)
# ==============================================================================

# STAGE 1 : Build de l'application Web React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des manifestes de dépendances
COPY package*.json ./

# Installation propre des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Build de production (Export des statiques dans /app/dist)
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2 : Serveur Web Nginx d'Exécution Ultra-Léger
FROM nginx:alpine AS runner

# Suppression de la configuration Nginx par défaut
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/nginx.conf

# Copie de la configuration Nginx SPA personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copie des fichiers statiques compilés du Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajustement des permissions pour exécuter Nginx sans privilèges root (Sécurité)
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html /tmp

# Utilisation de l'utilisateur non-privilégié nginx
USER nginx

# Exposition du port 80 interne
EXPOSE 80

# Démarrage Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]
