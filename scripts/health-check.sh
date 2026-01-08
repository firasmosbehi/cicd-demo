#!/bin/bash

# Health check and rollback script for Kubernetes deployments

SERVICE_NAME=$1
DEPLOYMENT_NAME=$2
NAMESPACE=${3:-default}

echo "Checking health for $SERVICE_NAME in namespace $NAMESPACE"

# Function to check deployment health
check_deployment_health() {
    local deployment=$1
    local namespace=$2
    
    # Check if deployment exists
    if ! kubectl get deployment $deployment -n $namespace >/dev/null 2>&1; then
        echo "Deployment $deployment not found"
        return 1
    fi
    
    # Check deployment status
    local ready_replicas=$(kubectl get deployment $deployment -n $namespace -o jsonpath='{.status.readyReplicas}')
    local replicas=$(kubectl get deployment $deployment -n $namespace -o jsonpath='{.status.replicas}')
    
    if [[ "$ready_replicas" != "$replicas" ]]; then
        echo "Deployment not ready: $ready_replicas/$replicas pods ready"
        return 1
    fi
    
    # Check pod health
    local unhealthy_pods=$(kubectl get pods -n $namespace -l app=$deployment -o jsonpath='{range .items[*]}{.status.phase}{"\n"}{end}' | grep -v Running | wc -l)
    if [[ $unhealthy_pods -gt 0 ]]; then
        echo "Found $unhealthy_pods unhealthy pods"
        return 1
    fi
    
    echo "Deployment health check passed"
    return 0
}

# Function to rollback deployment
rollback_deployment() {
    local deployment=$1
    local namespace=$2
    
    echo "Initiating rollback for $deployment in namespace $namespace"
    
    # Get previous revision
    local revision=$(kubectl rollout history deployment/$deployment -n $namespace --revision=0 2>/dev/null | tail -1 | awk '{print $1}')
    
    if [[ -n "$revision" && "$revision" =~ ^[0-9]+$ ]]; then
        kubectl rollout undo deployment/$deployment -n $namespace --to-revision=$revision
        echo "Rollback initiated to revision $revision"
    else
        echo "Could not determine previous revision for rollback"
        return 1
    fi
}

# Function to check service endpoints
check_service_endpoints() {
    local service=$1
    local namespace=$2
    
    local endpoints=$(kubectl get endpoints $service -n $namespace -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
    
    if [[ -z "$endpoints" ]]; then
        echo "No healthy endpoints found for service $service"
        return 1
    fi
    
    echo "Service endpoints are healthy"
    return 0
}

# Main health check loop
HEALTH_CHECK_COUNT=0
MAX_HEALTH_CHECKS=10
SLEEP_INTERVAL=30

while [[ $HEALTH_CHECK_COUNT -lt $MAX_HEALTH_CHECKS ]]; do
    echo "Health check attempt $((HEALTH_CHECK_COUNT + 1))/$MAX_HEALTH_CHECKS"
    
    if check_deployment_health $DEPLOYMENT_NAME $NAMESPACE && \
       check_service_endpoints $SERVICE_NAME $NAMESPACE; then
        echo "All health checks passed!"
        exit 0
    fi
    
    HEALTH_CHECK_COUNT=$((HEALTH_CHECK_COUNT + 1))
    
    if [[ $HEALTH_CHECK_COUNT -lt $MAX_HEALTH_CHECKS ]]; then
        echo "Waiting $SLEEP_INTERVAL seconds before next check..."
        sleep $SLEEP_INTERVAL
    fi
done

echo "Health checks failed after $MAX_HEALTH_CHECKS attempts"
echo "Initiating rollback procedure..."

if rollback_deployment $DEPLOYMENT_NAME $NAMESPACE; then
    echo "Rollback completed successfully"
    exit 1
else
    echo "Rollback failed"
    exit 2
fi