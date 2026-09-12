![CI/CD Pipeline](https://github.com/Abdullaagamal/study-planner/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black)

# Study Planner — DevOps Portfolio Project

A **minimal Next.js dashboard** wrapped in a complete software delivery pipeline: multi-stage Docker build, Kubernetes orchestration with Helm packaging, and automated CI/CD publishing container images to GitHub Container Registry.

Built to demonstrate a practical, end-to-end infrastructure setup — not a complex application.

---

## What it demonstrates

| Concept | Implementation |
|---|---|
| Multi-stage Docker build | `node:22-alpine` deps → build → production runner as non-root `nextjs` user |
| Kubernetes manifests | Deployment (probes, resource limits, downward API), Service, Ingress, ConfigMap |
| Helm chart | Parameterised templates, reusable helpers, values-driven configuration |
| GitHub Actions CI/CD | Lint + build + Helm lint on every commit; build + push container image on merge to `master` |
| Container image publishing | GitHub Container Registry with SHA-pinned and `latest` tags, GitHub Actions cache |

---

## Tech stack

- **Runtime:** Node.js 22
- **Framework:** Next.js 16 (App Router, `force-dynamic`)
- **Language:** JavaScript / JSX
- **Container:** Docker multi-stage (Alpine)
- **Orchestration:** Kubernetes
- **Packaging:** Helm 4
- **CI/CD:** GitHub Actions
- **Registry:** GitHub Container Registry (GHCR)

---

## Project structure

```
.
├── app/
│   ├── layout.js            # Root layout + metadata
│   └── page.js              # Dashboard (server component, dynamic per request)
├── k8s/                     # Raw Kubernetes manifests
│   ├── configmap.yml
│   ├── deployment.yml
│   ├── ingress.yml
│   └── service.yml
├── study-planner-chart/     # Helm chart
│   ├── templates/
│   │   ├── _helpers.tpl
│   │   ├── configmap.yml
│   │   ├── deployment.yml
│   │   ├── ingress.yml
│   │   └── service.yml
│   ├── Chart.yaml
│   └── values.yaml
├── .github/workflows/
│   └── ci-cd.yml            # CI (PRs) + CD (master merge)
├── Dockerfile               # 3-stage production build
├── docker-compose.yml       # Local containerised run
├── eslint.config.mjs
├── LICENSE
├── next.config.js
└── package.json
```

---

## Quickstart

### Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Run with Docker

```bash
docker compose up --build
# → http://localhost:3000
```

### Deploy to Kubernetes with kubectl

```bash
# Build & tag the image
docker build -t study-planner:latest .

# Create an alias for your cluster (minikube, kind, etc.)
eval $(minikube docker-env)
docker build -t study-planner:latest .

# Apply raw manifests
kubectl apply -f k8s/
kubectl get pods -l app=study-planner
kubectl port-forward svc/study-planner-service 3000:3000
```

### Deploy to Kubernetes with Helm

```bash
helm install study-planner ./study-planner-chart
helm status study-planner
```

Override values:

```bash
helm install study-planner ./study-planner-chart \
  --set image.repository=my-registry/study-planner \
  --set image.tag=abc123 \
  --set ingress.host=studyplanner.example.com \
  --set replicaCount=3
```

---

## CI/CD pipeline

Triggered on every push to `master` and on every pull request.

```
push / PR
  │
  ▼
┌────────────────────────────────────────────┐
│ CI (lint, build & validate)                │
│  npm ci → lint → next build                │
│  helm lint + helm template                 │
└────────────────────────────────────────────┘
  │
  ▼  (master only)
┌────────────────────────────────────────────┐
│ CD (build & publish image)                 │
│  Login to GHCR                             │
│  Docker buildx build → push to GHCR        │
│  Tags: <sha> + latest                      │
└────────────────────────────────────────────┘
```

---

## How the dashboard works

`app/page.js` is a **dynamic server component** (`export const dynamic = "force-dynamic"`). It renders on every request and reads runtime environment variables:

- **`NODE_ENV`** — injected via ConfigMap (`production`)
- **`POD_NAME`**, **`POD_IP`**, **`NODE_NAME`** — injected via the [Kubernetes Downward API](https://kubernetes.io/docs/concepts/workloads/pods/pod/#downward-api)

When run outside Kubernetes (local `npm run dev`), those values are absent and the dashboard shows a clean "local dev" fallback.

---

## What I learned

- Building minimal, reproducible containers with multi-stage Docker and standalone Next.js output
- Structuring Kubernetes manifests with proper health checks, resource limits, and environment injection
- Writing Helm charts with templates, helpers, and value-driven configuration
- Designing GitHub Actions workflows that lint, build, validate, and publish — triggered automatically by git activity
- Using the Kubernetes Downward API to surface live pod telemetry in an application UI

---

## Roadmap

- [ ] Add end-to-end smoke tests to the CI pipeline
- [ ] Deploy a staging environment automatically via GitHub Actions
- [ ] Add Prometheus metrics endpoint and ServiceMonitor Helm template
- [ ] Set up cert-manager for TLS on the Ingress

---

## License

[MIT](LICENSE)
