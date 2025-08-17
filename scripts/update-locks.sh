#!/bin/bash

# Iterate over workspaces using pnpm
pnpm -w ls --json | jq -c '.[]' | while read -r line; do
  # Extract location and name
  location=$(echo "$line" | jq -r '.path' | sed 's#^\./##')
  name=$(echo "$line" | jq -r '.name')

  # Check if location starts with "examples/" or "templates/"
  if [[ "$location" == examples/* ]] || [[ "$location" == templates/* ]]; then
    echo "Updating lockfile for $name in $location"
    if [ -d "$location" ]; then
      (cd "$location" && pnpm install)
    else
      echo "Directory does not exist: $location"
    fi
  fi
done
