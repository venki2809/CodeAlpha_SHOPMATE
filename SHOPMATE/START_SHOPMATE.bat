@echo off
cd /d "%~dp0"
echo Starting SHOPMATE frontend and backend...
if not exist "node_modules" (
  echo Installing required npm packages...
  call npm install || goto :error
)
call npm run dev
pause
exit /b
:error
echo Installation failed. Check Node.js and your internet connection.
pause
