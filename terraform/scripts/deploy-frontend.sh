#!/usr/bin/env bash
# Compila el frontend y lo sube a S3. Uso: terraform/scripts/deploy-frontend.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TF_DIR="$ROOT/terraform"

BUCKET="$(terraform -chdir="$TF_DIR" output -raw frontend_bucket)"
DISTRIBUTION="$(terraform -chdir="$TF_DIR" output -raw cloudfront_distribution_id)"

cd "$ROOT/frontend"
pnpm install --frozen-lockfile
# Vacío a propósito: el frontend y la API comparten dominio, así que las URLs son relativas.
VITE_API_URL= pnpm build

# Los archivos de assets/ llevan hash en el nombre: se pueden cachear para siempre.
aws s3 sync dist/assets "s3://$BUCKET/assets" \
  --cache-control "public,max-age=31536000,immutable"

# El resto (favicon, etc.) con caché corta. Los assets viejos se conservan
# para que las pestañas abiertas con la versión anterior sigan funcionando.
aws s3 sync dist "s3://$BUCKET" --delete \
  --exclude "assets/*" --exclude "index.html" \
  --cache-control "public,max-age=300"

aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache"

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*" \
  --query "Invalidation.Id" --output text

echo "Frontend desplegado en $(terraform -chdir="$TF_DIR" output -raw app_url)"
