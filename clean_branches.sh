#!/bin/bash

echo "start"

echo "mise à jour des références distantes..."
git fetch --prune

echo "suppression des branches locales obsolètes..."
branches_to_delete=$(git branch -vv | grep ': gone]' | awk '{print $1}')

if [ -z "$branches_to_delete" ]; then
    echo "aucune branche à supprimer"
else
    echo "$branches_to_delete" | xargs git branch -D
fi

echo "done" 