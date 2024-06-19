# Configure the S3 backend for storing Terraform state
terraform {
  backend "s3" {
    bucket = "vishnuverse.xyz"
    key    = "terraform.tfstate"
    region = "ap-south-1" # Replace with your desired region
  }
}
