resource "aws_security_group" "backend" {
  name        = "${local.name}-backend"
  description = "EC2 del backend: Caddy en 80/443"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${local.name}-backend" }
}

# 80 y 443 quedan abiertos porque Let's Encrypt necesita llegar a Caddy.
# Caddy rechaza con 403 cualquier petición sin el header secreto de CloudFront.
resource "aws_vpc_security_group_ingress_rule" "backend_http" {
  security_group_id = aws_security_group.backend.id
  description       = "HTTP (reto ACME y redirect a HTTPS)"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "backend_https" {
  security_group_id = aws_security_group.backend.id
  description       = "HTTPS desde CloudFront"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "backend_all" {
  security_group_id = aws_security_group.backend.id
  description       = "Salida a internet (ghcr, SSM, Let's Encrypt) y a RDS"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_security_group" "db" {
  name        = "${local.name}-db"
  description = "RDS: solo acepta conexiones desde la EC2"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${local.name}-db" }
}

resource "aws_vpc_security_group_ingress_rule" "db_from_backend" {
  security_group_id            = aws_security_group.db.id
  description                  = "PostgreSQL desde el backend"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  referenced_security_group_id = aws_security_group.backend.id
}
