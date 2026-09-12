![CI/CD Pipeline](https://github.com/Abdullaagamal/study-planner/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-black)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED)
![Kubernetes](https://img.shields.io/badge/Kubernetes-blue)
![Helm](https://img.shields.io/badge/Helm-v3-0F1689)

# Study Planner — DevOps Portfolio Project

A **minimal Next.js dashboard** wired through a complete, production-grade software delivery pipeline: multi-stage Docker build, Kubernetes orchestration with Helm packaging, and automated CI/CD that publishes container images to GitHub Container Registry.

The project is intentionally **infra-heavy on purpose**: the point is a practical, end-to-end DevOps setup, not a feature-rich application.

```
┌──────────┐   git push   ┌──────────────────────────┐        ┌──────┐
│ Developer │────────────▶│  GitHub Actions           │ push   │ GHCR │
└──────────┘              │  CI: lint/build/validate  │──────▶ │      │
                          │  CD: buildx + publish     │        └──┬───┘
                          └──────────────────────────┘           │ pull
                                                                  ▼
                                                 ┌──────────────────────────┐
                                                 │  Kubernetes               │
                                                 │  Deployment ──▶ Dashboard │
                                                 │  (Downward API telemetry) │
                                                 └──────────────────────────┘
```

## Live preview

```
┌──────────────────────────────────────────────────┐
│  ●  Study Planner                      Operational│
├──────────────────────────────────────────────────┤
│  Environment        Pod                           │
│  production         study-planner-7d8c94f5-x2n1l  │
│                                                    │
│  Node               Pod IP                         │
│  minikube           10.244.0.7                     │
├──────────────────────────────────────────────────┤
│  Served by a Next.js app running inside a Docker  │
│  container, orchestrated by Kubernetes.           │
└──────────────────────────────────────────────────┘
```

Run `npm run dev` — or deploy the stack — and the values above become live pod telemetry injected via the [Kubernetes Downward API](https://kubernetes.io/docs/concepts/workloads/pods/pod/#downward-api).

---

## What it demonstrates

| Concept | Implementation |
|---|---|
| Multi-stage Docker build | `node:22-alpine` deps → build → production runner as non-root `nextjs` user, `HEALTHCHECK` included |
| Kubernetes manifests | Deployment (2 replicas, probes, resource limits, downward API), Service (NodePort), Ingress, ConfigMap |
| Manifest validation | `kubeconform` validates both raw `k8s/` and Helm-rendered manifests — offline, no cluster needed |
| Helm chart | Parameterised templates, reusable `_helpers.tpl`, values-driven configuration |
| GitHub Actions CI/CD | CI on every commit/PR (lint, build, validate); CD on `master` merge (build + push image) |
| Image publishing | GHCR with SHA-pinned and `latest` tags, GitHub Actions build cache |
| Live telemetry | Dashboard reads `POD_NAME` / `POD_IP` / `NODE_NAME` injected by Kubernetes |

## Tech stack

- **Runtime:** Node.js 22
- **Framework:** Next.js 16 (App Router, dynamic server component)
- **Language:** JavaScript / JSX
- **Container:** Docker multi-stage (Alpine)
- **Orchestration:** Kubernetes (`apps/v1`)
- **Packaging:** Helm
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
│   └── ci-cd.yml            # CI (commits/PRs) + CD (master merge)
├── Dockerfile               # 3-stage production build
├── docker-compose.yml       # Local containerised run
├── eslint.config.mjs
├── LICENSE
├── next.config.js
└── package.json
```

---

## Quickstart

### Prerequisites

- Node.js 20.9+
- Docker 24+ (for the containerised paths)
- Optional: a local Kubernetes cluster — [minikube](https://minikube.sigs.k8s.io/docs/), [kind](https://kind.sigs.k8s.io/), or Docker Desktop's built-in cluster

### 1. Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 2. Run with Docker

```bash
docker compose up --build
# → http://localhost:3000
```

### 3. Deploy with kubectl

The image is public on GHCR, so `kubectl` will pull it automatically:

```bash
kubectl apply -f k8s/
kubectl get pods -l app=study-planner
kubectl port-forward svc/study-planner-service 3000:3000
```

> Forked it and pushing your own image? Override the image in `k8s/deployment.yml`, or build locally and point the cluster at your Docker daemon first:
> `eval $(minikube docker-env) && docker build -t study-planner:latest .`

### 4. Deploy with Helm

```bash
helm install study-planner ./study-planner-chart
helm status study-planner
```

Override releases without editing files:

```bash
helm install study-planner ./study-planner-chart \
  --set image.repository=my-registry/study-planner \
  --set image.tag=$GITHUB_SHA \
  --set replicaCount=3 \
  --set ingress.host=studyplanner.example.com
```

Key chart values (`study-planner-chart/values.yaml`):

| Key | Default | Purpose |
|---|---|---|
| `replicaCount` | `2` | Desired pod count |
| `image.repository` | `ghcr.io/abdullaagamal/study-planner` | Image name |
| `image.tag` | `latest` | Image tag |
| `image.pullPolicy` | `Always` | Image pull behaviour |
| `service.type` | `NodePort` | Service exposure (NodePort / ClusterIP / LoadBalancer) |
| `service.nodePort` | `30000` | Node port when `type: NodePort` |
| `ingress.host` | `studyplanner.local` | Ingress host |
| `resources.requests / limits` | `100m/128Mi · 250m/256Mi` | CPU & memory bounds |

---

## CI/CD pipeline

Triggered on every push to `master` (full pipeline) and on every pull request (CI only).

```
push / PR
  │
  ▼
┌────────────────────────────────────────────┐
│ CI — lint, build & validate                │
│  npm ci → eslint → next build              │
│  helm lint                                  │
│  kubeconform (raw k8s + Helm-rendered)      │
└────────────────────────────────────────────┘
  │
  ▼  (master only)
┌────────────────────────────────────────────┐
│ CD — build & publish image                 │
│  docker login → GHCR                       │
│  buildx build + push → GHCR                │
│  tags: <git-sha> and latest                │
└────────────────────────────────────────────┘
```

---

## How the dashboard works

`app/page.js` is a **dynamic server component** (`export const dynamic = "force-dynamic"`). Instead of baking values in at build time, the page renders on every request and reads **runtime environment variables**:

- **`NODE_ENV`** — injected via the ConfigMap (`production`)
- **`POD_NAME`**, **`POD_IP`**, **`NODE_NAME`** — injected by Kubernetes via the [Downward API](https://kubernetes.io/docs/concepts/workloads/pods/pod/#downward-api)

Run it outside a cluster and the dashboard falls back to clean "local dev" values — the same container image serves both worlds.

---

## What I learned

- Building minimal, reproducible containers with multi-stage Docker and Next.js standalone output
- Structuring Kubernetes manifests with health probes, resource limits, and environment injection
- Writing Helm charts with named templates, helpers, and values-driven configuration
- Designing GitHub Actions workflows that lint, build, validate, and publish — without any manual steps
- Using the Kubernetes Downward API to surface live pod telemetry in an application UI
- Validating Kubernetes manifests offline in CI (`kubeconform`) instead of depending on a live cluster

## Debugging snapshot

> One CI failure taught me more than a dozen green runs. My first validation step used
> `kubectl create --dry-run=client -f k8s`, which — as it turned out — needs a live cluster
> to fetch the OpenAPI schema. The runner had no cluster, so every pipeline failed.
> I swapped it for **kubeconform**, a standalone validator that checks manifests against
> official Kubernetes schemas with no cluster required. Now the raw manifests *and* the
> Helm-rendered output are validated on every commit.

---

## Roadmap

- [ ] Add end-to-end smoke tests to the CI pipeline
- [ ] Automatically deploy a staging environment from GitHub Actions
- [ ] Expose a Prometheus metrics endpoint + `ServiceMonitor`
- [ ] Terminate TLS with cert-manager on the Ingress

---

## License

[MIT](LICENSE)