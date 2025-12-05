#!/bin/bash

# Script de déploiement des secrets Cloudflare
# Usage: ./scripts/deploy-secrets.sh <app> [environment]
# 
# Ce script déploie les secrets depuis les variables d'environnement GitLab CI/CD
# vers Cloudflare Workers sans les supprimer à chaque déploiement.

set -e

APP=$1
ENV=${2:-production}

if [ -z "$APP" ]; then
  echo "❌ Usage: $0 <frontend|backend> [environment]"
  echo "   Exemple: $0 frontend production"
  exit 1
fi

echo "🚀 Déploiement des secrets pour $APP ($ENV)"

# Vérifier les credentials Cloudflare
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_ACCOUNT_ID et CLOUDFLARE_API_TOKEN doivent être définis"
  exit 1
fi

export CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID
export CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN

# Fonction pour déployer un secret
deploy_secret() {
  local SECRET_NAME=$1
  local SECRET_VALUE=${!SECRET_NAME}
  
  if [ -n "$SECRET_VALUE" ]; then
    echo "📝 Déploiement de $SECRET_NAME..."
    if [ "$ENV" = "production" ]; then
      echo "$SECRET_VALUE" | npx wrangler secret put "$SECRET_NAME" 2>/dev/null || echo "⚠️  Erreur lors du déploiement de $SECRET_NAME"
    else
      echo "$SECRET_VALUE" | npx wrangler secret put "$SECRET_NAME" --env "$ENV" 2>/dev/null || echo "⚠️  Erreur lors du déploiement de $SECRET_NAME"
    fi
  else
    echo "⏭️  $SECRET_NAME non défini, ignoré"
  fi
}

# Configuration par application
if [ "$APP" = "frontend" ]; then
  cd apps/user-application
  echo "📦 Secrets Frontend (kurama): Aucun secret à déployer via script"
  echo "   Les plaintext (DATABASE_HOST, GOOGLE_CLIENT_ID) sont dans wrangler.jsonc"
  echo "   Les secrets sont gérés manuellement dans Cloudflare Dashboard"
  
elif [ "$APP" = "backend" ]; then
  cd apps/data-service
  echo "📦 Secrets Backend (back-kurama): Aucun secret à déployer via script"
  
else
  echo "❌ App invalide. Utilisez 'frontend' ou 'backend'"
  exit 1
fi

echo ""
echo "✅ Déploiement des secrets terminé pour $APP ($ENV)"
