# Configure the S3 backend for storing Terraform state
terraform {
  backend "s3" {
    key    = "api-terraform/terraform.tfstate"
    region = "ap-south-1" 
  }
}
