#!/usr/bin/env bash
trap 'kill 0' EXIT
(cd backend && npm run start:dev) &
(cd frontend && npm run dev) &
wait
