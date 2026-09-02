variable "minio_root_user" {
  description = "Admin username for the MinIO container"
  type        = string
  default     = "lmsadmin"
}

variable "minio_root_password" {
  description = "Admin password for the MinIO container"
  type        = string
  sensitive   = true
  default     = "changeme12345"
}

variable "bucket_name" {
  description = "Name of the bucket that will store course materials"
  type        = string
  default     = "course-materials"
}