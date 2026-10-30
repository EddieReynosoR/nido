# Estado remoto en S3. El bucket se crea una sola vez con terraform/bootstrap.
# Los valores van en backend.hcl (ver backend.hcl.example):
#   terraform init -backend-config=backend.hcl
terraform {
  backend "s3" {
    key          = "nido/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
