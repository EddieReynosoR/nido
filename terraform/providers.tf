provider "aws" {
  region = var.region

  default_tags {
    tags = local.tags
  }
}

# CloudFront solo acepta certificados ACM emitidos en us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

locals {
  name          = var.project
  origin_domain = "origin.${var.app_domain}"

  tags = {
    Project   = var.project
    ManagedBy = "terraform"
  }
}
