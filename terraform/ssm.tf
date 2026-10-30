# Los valores aleatorios quedan en el tfstate: el bucket de estado está cifrado y es privado.
resource "random_password" "db" {
  length  = 32
  special = false
}

# JwtService decodifica el secreto como Base64.
resource "random_bytes" "jwt" {
  length = 64
}

resource "random_password" "origin_verify" {
  length  = 40
  special = false
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project}/db_password"
  type  = "SecureString"
  value = random_password.db.result
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project}/jwt_secret"
  type  = "SecureString"
  value = random_bytes.jwt.base64
}

resource "aws_ssm_parameter" "origin_verify" {
  name  = "/${var.project}/origin_verify"
  type  = "SecureString"
  value = random_password.origin_verify.result
}

resource "aws_ssm_parameter" "ghcr_token" {
  count = var.ghcr_token == "" ? 0 : 1

  name  = "/${var.project}/ghcr_token"
  type  = "SecureString"
  value = var.ghcr_token
}
