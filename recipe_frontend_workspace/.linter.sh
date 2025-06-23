#!/bin/bash
cd /home/kavia/workspace/code-generation/recipevault-32159-84292154/recipe_frontend_workspace/recipe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

