data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "backend" {
  ami                    = data.aws_ssm_parameter.al2023_ami.value
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = aws_iam_instance_profile.backend.name

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 30
    encrypted   = true
  }

  user_data = templatefile("${path.module}/templates/user_data.sh.tftpl", {
    region        = var.region
    project       = var.project
    ghcr_username = var.ghcr_username
    use_ghcr_auth = var.ghcr_token != ""
    env_file = templatefile("${path.module}/templates/env.tftpl", {
      backend_image = var.backend_image
      db_host       = aws_db_instance.main.address
      db_port       = aws_db_instance.main.port
      db_name       = var.db_name
      db_username   = var.db_username
      app_origin    = "https://${var.app_domain}"
      java_max_heap = var.java_max_heap
    })
    compose_file = file("${path.module}/templates/compose.yml")
    caddyfile = templatefile("${path.module}/templates/Caddyfile.tftpl", {
      origin_domain = local.origin_domain
      acme_email    = var.acme_email
    })
  })

  # Cambiar el user_data recrea la instancia para que arranque con la config nueva.
  user_data_replace_on_change = true

  # Una AMI nueva no debe recrear la instancia en cada plan.
  lifecycle {
    ignore_changes = [ami]
  }

  tags = { Name = "${local.name}-backend" }
}

resource "aws_eip" "backend" {
  domain   = "vpc"
  instance = aws_instance.backend.id

  tags = { Name = "${local.name}-backend" }
}
