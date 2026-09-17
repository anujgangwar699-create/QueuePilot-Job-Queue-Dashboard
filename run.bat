@echo off
cd /d %~dp0
start "QueuePilot Backend" cmd /k "cd backend && npm run start:dev"
start "QueuePilot Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 4 >nul
start http://localhost:5173
