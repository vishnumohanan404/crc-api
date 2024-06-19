
variable "aws_region" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "public_subnet_cidr_block" {
  type = string
}

variable "private_subnet_cidr_block" {
  type = string
}

variable "availability_zones" {
  type = list(string)
}

# create a private subnet for dynamodb
resource "aws_vpc" "vpc" {
  cidr_block         = var.vpc_cidr
  enable_dns_support = true

  tags = {
    Name = "My-VPC"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = var.public_subnet_cidr_block
  tags = {
    Name = "public-Subnet"
  }
}

resource "aws_subnet" "private_subnet" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = var.private_subnet_cidr_block
  tags = {
    Name = "private-Subnet"
  }
}

