output "app_url" {
  description = "URL pública de la app."
  value       = "https://${var.app_domain}"
}

output "region" {
  description = "Región de la EC2 y RDS."
  value       = var.region
}

output "frontend_bucket" {
  description = "Bucket donde se sube frontend/dist."
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución, para invalidar caché."
  value       = aws_cloudfront_distribution.main.id
}

output "backend_instance_id" {
  description = "ID de la EC2 (para SSM Session Manager)."
  value       = aws_instance.backend.id
}

output "backend_origin" {
  description = "Nombre del origen del backend."
  value       = local.origin_domain
}

output "rds_endpoint" {
  description = "Host de RDS (solo accesible desde la VPC)."
  value       = aws_db_instance.main.address
}
