#!/usr/bin/env bash
# wait-for-it.sh — wait for services to be available before proceeding
# Usage: ./scripts/wait-for-it.sh host:port [host:port...] -- command args...

set -e

TIMEOUT=60
QUIET=0

usage() {
  echo "Usage: $0 host:port [host:port...] -- command args..."
  exit 1
}

wait_for_host() {
  local host=$1
  local port=$2
  local host_port="${host}:${port}"

  echo "Waiting for ${host_port}..."

  for i in $(seq 1 $TIMEOUT); do
    if nc -z "$host" "$port" 2>/dev/null; then
      echo "${host_port} is available after ${i} seconds"
      return 0
    fi
    sleep 1
  done

  echo "Timed out after ${TIMEOUT} seconds waiting for ${host_port}"
  exit 1
}

if [ $# -eq 0 ]; then
  usage
fi

# Find the -- separator
SEPARATOR_INDEX=0
for i in $(seq 1 $#); do
  if [ "${!i}" = "--" ]; then
    SEPARATOR_INDEX=$i
    break
  fi
done

if [ $SEPARATOR_INDEX -eq 0 ]; then
  echo "Error: no '--' separator found"
  usage
fi

# Collect host:port pairs
HOST_PORTS=()
for i in $(seq 1 $((SEPARATOR_INDEX - 1))); do
  HOST_PORTS+=("${!i}")
done

# Remaining args after -- are the command
COMMAND=("${@:((SEPARATOR_INDEX + 1))}")

# Wait for each host:port
for hp in "${HOST_PORTS[@]}"; do
  IFS=':' read -r host port <<< "$hp"
  wait_for_host "$host" "$port"
done

# Execute command
if [ ${#COMMAND[@]} -gt 0 ]; then
  echo "All hosts available. Executing: ${COMMAND[*]}"
  exec "${COMMAND[@]}"
fi
