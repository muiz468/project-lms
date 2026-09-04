# Reflection — LMS Capstone

## What was hardest

Honestly, the hardest part wasn't any single tool — it was the number of small, unrelated things that could each quietly break the whole chain. A missing comma in a JSON config, a typo in a folder name (`route` vs `routes`), a test that hung forever because a server never got closed after a failed assertion — none of these were "hard" concepts once I understood them, but each one stopped everything until I tracked it down.

The single biggest time sink was trying to get Ingress working in Kubernetes. The controller kept failing to pull one specific image, and it took a while to work out that it wasn't a Kubernetes problem at all — the image was hosted behind a CDN (Fastly) that my network just couldn't reach, even though everything else online worked fine. I tried changing DNS settings, restarting Docker Desktop, fully shutting down WSL — none of it fixed the actual network path. What actually helped was stepping back and remembering the assignment itself allows NodePort as a fallback when Ingress isn't available in my environment. I'd spent so much effort trying to force the "expected" solution that I didn't consider the sanctioned alternative was right there.

The other recurring theme was Git itself — not the concepts, but small mechanical things like running `git add .` from inside a subfolder and not realizing it wouldn't pick up a file one level up, or trying to switch branches with uncommitted changes still sitting there. None of these were serious, but they added up in terms of time and made me slow down and actually read `git status` output properly instead of assuming.

## What I'd do differently in a production setting

If this were a real production system rather than a capstone demo, the first thing I'd change is the database. SQLite works fine for a single-instance local project, but it can't be shared across multiple pods, which means the app can never scale horizontally as it stands. I'd move to a proper networked database like PostgreSQL, most likely run as a managed service rather than something I maintain myself, so the app tier could run multiple replicas behind the Service instead of being stuck at one.

I'd also stop keeping Terraform's state locally. Right now it lives on my own machine, which is fine for one person working alone, but in a team setting that becomes a real risk — two people could run `terraform apply` at slightly different times and corrupt each other's changes. A remote backend with locking (like an S3 bucket plus DynamoDB, or Terraform Cloud) would be one of the first things I'd set up before letting anyone else touch this.