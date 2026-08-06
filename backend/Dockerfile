# ==============================================================================
# DOCKERFILE MULTI-STAGE — BACKEND NESTJS + PRISMA (KPSYSCHOOL)
# ==============================================================================

# STAGE 1 : Build & Compilation
FROM node:20-alpine AS builder

# Installation d'OpenSSL pour Prisma sous Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copie des manifestes de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation de toutes les dépendances
RUN npm install

# Copie du code source
COPY . .

# Génération du client Prisma compilé
RUN npx prisma generate

# Compilation NestJS en JavaScript pur (/dist)
RUN npm run build

# Nettoyage des devDependencies pour ne garder que la prod dans node_modules
RUN npm prune --production

# ------------------------------------------------------------------------------
# STAGE 2 : Image d'Exécution Légère de Production
FROM node:20-alpine AS runner

# Installation d'OpenSSL runtime pour Prisma sous Alpine
RUN apk add --no-cache openssl libc6-compat

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
