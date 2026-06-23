#!/bin/bash
set -e

# ── Config ────────────────────────────────────────────────────────────────────
read -p "DockerHub username: " DOCKERHUB_USERNAME
read -p "DB password (choose any): " DB_PASSWORD
read -p "JWT secret (min 32 chars): " JWT_SECRET

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "==> Switching to docker-desktop context..."
kubectl config use-context docker-desktop

echo "==> Applying namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

echo "==> Creating secrets..."
kubectl create secret generic trekr-secrets \
  --namespace=trekr \
  --from-literal=db-password="$DB_PASSWORD" \
  --from-literal=jwt-secret="$JWT_SECRET" \
  --save-config \
  --dry-run=client -o yaml | kubectl apply -f -

echo "==> Creating DB init ConfigMap from DDL..."
kubectl create configmap trekr-db-init \
  --namespace=trekr \
  --from-file=01-ddl.sql="$SCRIPT_DIR/../db-scripts/ddl.sql" \
  --save-config \
  --dry-run=client -o yaml | kubectl apply -f -

echo "==> Applying ConfigMaps..."
kubectl apply -f "$SCRIPT_DIR/configmaps.yaml"

echo "==> Applying Postgres StatefulSet..."
kubectl apply -f "$SCRIPT_DIR/postgres.yaml"

echo "==> Waiting for Postgres..."
kubectl rollout status statefulset/postgres -n trekr --timeout=120s

echo "==> Applying Backend Deployment..."
sed "s|DOCKERHUB_USERNAME|$DOCKERHUB_USERNAME|g" "$SCRIPT_DIR/backend.yaml" | kubectl apply -f -

echo "==> Applying Frontend Deployment..."
sed "s|DOCKERHUB_USERNAME|$DOCKERHUB_USERNAME|g" "$SCRIPT_DIR/frontend.yaml" | kubectl apply -f -

echo "==> Applying Ingress..."
kubectl apply -f "$SCRIPT_DIR/ingress.yaml"

echo "==> Waiting for backend rollout..."
kubectl rollout status deployment/backend -n trekr --timeout=180s

echo "==> Waiting for frontend rollout..."
kubectl rollout status deployment/frontend -n trekr --timeout=60s

echo ""
echo "==> Adding trekr.local to /etc/hosts (needs sudo)..."
if ! grep -q "trekr.local" /etc/hosts; then
  echo "127.0.0.1 trekr.local" | sudo tee -a /etc/hosts
fi

echo ""
echo "✅ Done! Open http://trekr.local in your browser."
