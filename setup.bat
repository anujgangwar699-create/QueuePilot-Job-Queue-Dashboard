@echo off
echo Installing QueuePilot dependencies...
cd /d %~dp0backend
call npm install
cd /d %~dp0frontend
call npm install
echo.
echo Setup complete. Double-click run.bat to start the project.
pause
