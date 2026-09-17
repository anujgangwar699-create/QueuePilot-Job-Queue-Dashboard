#!/usr/bin/env bash
set -e
(cd backend && npm install)
(cd frontend && npm install)
echo "Setup complete. Run ./run.sh"
