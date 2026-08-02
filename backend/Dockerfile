# ==============================================================================
# DOCKERFILE MULTI-STAGE — BACKEND NESTJS + PRISMA (KPSYSCHOOL)
# ==============================================================================

# STAGE 1 : Build & Compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des manifestes de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation de toutes les dépendances (y compris devDependencies pour Nest CLI et Prisma)
RUN npm ci

# Génération du client Prisma compilé
RUN npx prisma generate

# Copie du code source
COPY . .

# Compilation NestJS en JavaScript pur (/dist)
RUN npm run build

# Nettoyage des devDependencies pour ne garder que la prod dans node_modules
RUN npm prune --production

# ------------------------------------------------------------------------------
# STAGE 2 : Image d'Exécution Légère de Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copie des dépendances de prod et du code compilé
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY entrypoint.sh ./

# Rendre le script d'entrée exécutable et ajuster les permissions pour l'utilisateur node
RUN chmod +x entrypoint.sh && chown -R node:node /app

# Utilisation de l'utilisateur non-privilégié node (Sécurité)
USER node

# Exposition du port interne NestJS
EXPOSE 3000

# Point d'entrée : Exécution de prisma migrate deploy puis démarrage NestJS
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
