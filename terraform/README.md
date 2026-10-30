# Despliegue de Nido en AWS con Terraform

```
Usuario ──HTTPS──> CloudFront (app_domain)
                    ├─ /*                 → S3 privado (frontend/dist)
                    └─ /api/*, /auth/*    → origin.<app_domain> (EC2: Caddy → backend :9000)
                                                                    └─> RDS PostgreSQL 16
```

Frontend y API van en **el mismo dominio** porque la cookie `refreshToken` es
`SameSite=Strict` y el frontend lee `XSRF-TOKEN` desde `document.cookie`. Por eso el
frontend se compila con `VITE_API_URL=` vacío.

| Recurso | Detalle |
| --- | --- |
| EC2 `t3.micro` | Docker con la imagen de `ghcr.io`, más Caddy con TLS de Let's Encrypt. Sin SSH: acceso por SSM Session Manager. |
| RDS `db.t4g.micro` | PostgreSQL 16, 20 GB, subred privada, solo acepta conexiones desde la EC2. |
| S3 + CloudFront | Bucket privado con OAC. Las rutas del SPA se reescriben a `index.html`. |
| SSM Parameter Store | Contraseña de la DB, `JWT_SECRET` y el header secreto de CloudFront. |
| Route 53 + ACM | Certificado para `app_domain` y registros DNS en tu zona existente. |

## Requisitos

- Terraform >= 1.10, AWS CLI v2, pnpm.
- Credenciales de AWS configuradas (`aws configure` o `AWS_PROFILE`).
- Una zona hospedada en Route 53 para tu dominio.
- La imagen del backend publicada en `ghcr.io` (la publica `.github/workflows/backend-docker-publish.yml`).
  Si el paquete es privado, crea un PAT con `read:packages` y ponlo en `ghcr_token`.

## Primer despliegue

```bash
cd terraform

# 1. Bucket para el estado (una sola vez)
terraform -chdir=bootstrap init
terraform -chdir=bootstrap apply
cp backend.hcl.example backend.hcl   # pon el bucket que imprimió el paso anterior

# 2. Variables
cp terraform.tfvars.example terraform.tfvars   # edita dominio, correo, etc.

# 3. Infraestructura (~15 min: RDS y CloudFront son lentos)
terraform init -backend-config=backend.hcl
terraform apply

# 4. Frontend
./scripts/deploy-frontend.sh
```

La EC2 tarda unos minutos más en instalar Docker, descargar la imagen y obtener el
certificado del origen. Puedes ver el progreso con:

```bash
aws ssm start-session --target "$(terraform output -raw backend_instance_id)"
sudo tail -f /var/log/nido-bootstrap.log
sudo docker compose -f /opt/nido/compose.yml logs -f
```

## Despliegues siguientes

- **Backend:** haz push a `master` para que GitHub Actions publique la imagen, y luego corre
  `./scripts/deploy-backend.sh`. Flyway aplica las migraciones al arrancar.
- **Frontend:** `./scripts/deploy-frontend.sh`.
- **Infraestructura:** `terraform plan` y `terraform apply`. Si cambias el `user_data`
  (variables de la EC2 o plantillas), Terraform recrea la instancia.

## Comprobaciones

```bash
curl -I https://<app_domain>                 # 200, HTML
curl -I https://<app_domain>/notes/x         # 200, index.html (rutas del SPA)
curl -i https://<app_domain>/auth/csrf       # responde el backend
curl -i https://origin.<app_domain>          # 403: sin el header de CloudFront
```

## Acceso a la base de datos

RDS no es público. Abre un túnel por SSM y conéctate a `localhost:5432`:

```bash
aws ssm start-session \
  --target "$(terraform output -raw backend_instance_id)" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "host=$(terraform output -raw rds_endpoint),portNumber=5432,localPortNumber=5432"

aws ssm get-parameter --name /nido/db_password --with-decryption --query Parameter.Value --output text
```

## Costos

Dentro del free tier (EC2 750 h, RDS 750 h, 1 TB de CloudFront) cuesta ~$0.50/mes, que es
la zona de Route 53. Sin free tier: ~$25/mes (EC2 ~$8, RDS ~$12, IP pública ~$3.6).
No se usa NAT Gateway ni balanceador, que son lo más caro.

Las cuentas en free tier solo permiten 1 día de backups en RDS (`db_backup_retention_days`).

## Borrar todo

```bash
# En terraform.tfvars: db_deletion_protection = false
terraform apply
aws s3 rm "s3://$(terraform output -raw frontend_bucket)" --recursive
terraform destroy
```

RDS deja un snapshot final (`nido-db-final`) salvo que pongas `db_skip_final_snapshot = true`.
Borra el snapshot a mano si no lo necesitas, porque también cobra almacenamiento.
