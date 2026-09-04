# LMS — DevOps Capstone Project

This is my submission for the Deejoft Academy DevOps capstone — Project 4, the E-Learning/LMS mini-platform. The goal was the full pipeline around it: Git, CI/CD, Docker, Kubernetes, Terraform, and Ansible all working together end to end.

## What it does

A small LMS where a facilitator can upload course resources (title, description, a link) and students can view them and mark them as completed. Roles are hardcoded via a request header (`X-Role: facilitator` or `X-Role: student`) since the assignment scope is about the pipeline, not building real authentication.

## Stack

- **App:** Node.js + Express, SQLite for storage
- **CI/CD:** GitHub Actions
- **Containerization:** Docker (multi-stage build, non-root user)
- **Orchestration:** Kubernetes (via kind, running locally)
- **Infrastructure:** Terraform (provisions a MinIO container to stand in for S3-compatible object storage)
- **Configuration management:** Ansible (Nginx reverse proxy)

## Architecture

The app is one Express service backed by SQLite. In Kubernetes, it runs as a single replica (more on why below) with a ConfigMap for non-secret settings (site name, max upload size) and a PersistentVolumeClaim so the database file survives pod restarts. A Service exposes it — I ended up using NodePort instead of Ingress (explained below).

Terraform separately provisions a MinIO container to represent the object storage layer for course materials, plus the bucket inside it.

Ansible configures an Nginx reverse proxy in front of the app — this runs against the docker-compose version of the app rather than the Kubernetes one, since that's a more realistic and stable target for a local demo (see below for why).

## Getting it running locally

You'll need Docker Desktop with WSL2 integration, `kind`, `kubectl`, Terraform, and Ansible installed.

**1. Run the app directly:**
```bash
docker compose up --build
```
Then hit `http://localhost:3000/health` to confirm it's up.

**2. Deploy to Kubernetes:**
```bash
kind create cluster --name devops-lab   # or use an existing cluster
kubectl create namespace deejoft-lms
kubectl config set-context --current --namespace=deejoft-lms
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl port-forward service/lms-service 8080:80
```
Then `curl http://localhost:8080/health`.

**3. Provision storage with Terraform:**
```bash
cd terraform
terraform init
terraform apply
```
MinIO console will be at `http://localhost:9001` (login: `lmsadmin` / `changeme12345` — see the note below about that).

**4. Set up the reverse proxy with Ansible:**
```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml --ask-become-pass
```

## Why NodePort instead of Ingress

I built the Ingress setup first (ingress-nginx controller, the works), but ran into a persistent network issue where the controller's admission webhook image couldn't be pulled — traced to the CDN it's hosted on (Fastly) being unreachable from my network, not anything wrong with the Kubernetes config itself. Since the assignment explicitly allows NodePort/LoadBalancer as an alternative when Ingress isn't available in your environment, I used that instead. I'd like to revisit real Ingress from a different network at some point.

## Why the SQLite + single replica limitation

SQLite is a single file, and the PVC backing it only supports one reader/writer at a time (`ReadWriteOnce`). That means this setup can't horizontally scale past one pod — fine for a demo, not something I'd ship to production as-is.

## What I'd improve with more time

- Swap SQLite for a real networked database (Postgres) so the app could actually scale to multiple replicas
- Get Ingress working properly instead of the NodePort workaround
- Move Terraform state to a remote backend (S3 + DynamoDB locking, or similar) instead of local state — fine for a solo project, not for a team
- Stop hardcoding a default MinIO password in `variables.tf` — should be pulled from a `.tfvars` file that's gitignored, or a real secrets manager
- Wire the Ansible reverse proxy to sit in front of the Kubernetes-deployed app instead of the separate docker-compose instance
- Add more automated tests beyond the one health check — resource creation, completion logic, role checks