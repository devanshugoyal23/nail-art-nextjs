#!/bin/bash
# Generate the remaining missing states

states=("Utah" "Vermont" "Virginia" "Washington" "West Virginia" "Wisconsin" "Wyoming" "Rhode Island")

for state in "${states[@]}"; do
  echo "Generating $state..."
  npm run generate-cities -- --state="$state"
  echo ""
done

echo "✨ All missing states generated!"

