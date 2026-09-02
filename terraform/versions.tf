terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
    minio = {
      source  = "aminueza/minio"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

provider "minio" {
  minio_server   = "localhost:9000"
  minio_user     = var.minio_root_user
  minio_password = var.minio_root_password
  minio_ssl      = false
}