resource "docker_image" "minio" {
  name = "minio/minio:latest"
}

resource "docker_container" "minio" {
  name  = "lms-minio"
  image = docker_image.minio.image_id

  ports {
    internal = 9000
    external = 9000
  }
  ports {
    internal = 9001
    external = 9001
  }

  env = [
    "MINIO_ROOT_USER=${var.minio_root_user}",
    "MINIO_ROOT_PASSWORD=${var.minio_root_password}"
  ]

  command = ["server", "/data", "--console-address", ":9001"]

  volumes {
    volume_name    = "lms-minio-data"
    container_path = "/data"
  }
}

resource "minio_s3_bucket" "course_materials" {
  bucket = var.bucket_name

  depends_on = [docker_container.minio]
}