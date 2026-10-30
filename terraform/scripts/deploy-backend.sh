#!/usr/bin/env bash
# Descarga la última imagen del backend en la EC2 y reinicia el contenedor.
# Uso: terraform/scripts/deploy-backend.sh  (después de que GitHub Actions publique la imagen)
set -euo pipefail

TF_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INSTANCE_ID="$(terraform -chdir="$TF_DIR" output -raw backend_instance_id)"
REGION="$(terraform -chdir="$TF_DIR" output -raw region)"

COMMAND_ID="$(aws ssm send-command \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "nido: deploy backend" \
  --parameters 'commands=["/opt/nido/start.sh"]' \
  --query Command.CommandId --output text)"

echo "Comando enviado: $COMMAND_ID. Esperando..."
aws ssm wait command-executed --region "$REGION" \
  --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" || true

aws ssm get-command-invocation --region "$REGION" \
  --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" \
  --query "{Estado:Status,Salida:StandardOutputContent,Error:StandardErrorContent}" \
  --output yaml
