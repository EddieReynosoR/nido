variable "region" {
  description = "Región de AWS donde corren la EC2, RDS y S3."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Prefijo para nombrar recursos."
  type        = string
  default     = "nido"
}

variable "domain_name" {
  description = "Zona hospedada existente en Route 53 (por ejemplo, ejemplo.com)."
  type        = string
}

variable "app_domain" {
  description = "Dominio público de la app (por ejemplo, nido.ejemplo.com o ejemplo.com). Debe pertenecer a domain_name."
  type        = string
}

variable "acme_email" {
  description = "Correo para Let's Encrypt (avisos de expiración del certificado del origen)."
  type        = string
}

variable "instance_type" {
  description = "Tipo de EC2. t3.micro entra en el free tier y es x86, como la imagen de ghcr."
  type        = string
  default     = "t3.micro"
}

variable "backend_image" {
  description = "Imagen Docker del backend."
  type        = string
  default     = "ghcr.io/eddiereynosor/nido:latest"
}

variable "ghcr_username" {
  description = "Usuario de GitHub para descargar la imagen si el paquete es privado."
  type        = string
  default     = ""
}

variable "ghcr_token" {
  description = "PAT con read:packages si el paquete de ghcr es privado. Vacío si es público."
  type        = string
  default     = ""
  sensitive   = true
}

variable "java_max_heap" {
  description = "Heap máximo de la JVM. Con 1 GB de RAM, 512m deja espacio para Caddy y el sistema."
  type        = string
  default     = "512m"
}

variable "db_name" {
  description = "Nombre de la base de datos."
  type        = string
  default     = "nido"
}

variable "db_username" {
  description = "Usuario maestro de RDS."
  type        = string
  default     = "nido"
}

variable "db_instance_class" {
  description = "Clase de RDS. db.t4g.micro entra en el free tier."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_engine_version" {
  description = "Versión mayor de PostgreSQL."
  type        = string
  default     = "16"
}

variable "db_allocated_storage" {
  description = "Almacenamiento de RDS en GB (el free tier incluye 20)."
  type        = number
  default     = 20
}

variable "db_backup_retention_days" {
  description = "Días de backups automáticos. Las cuentas en free tier solo permiten 1."
  type        = number
  default     = 1
}

variable "db_deletion_protection" {
  description = "Impide borrar la base de datos por accidente. Ponlo en false antes de un destroy."
  type        = bool
  default     = true
}

variable "db_skip_final_snapshot" {
  description = "Si es false, RDS toma un snapshot final al borrarse."
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "Rango de la VPC."
  type        = string
  default     = "10.20.0.0/16"
}
