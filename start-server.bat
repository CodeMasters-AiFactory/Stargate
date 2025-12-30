@echo off
echo Starting server...
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "c:\CURSOR PROJECTS\StargatePortal"
echo Current directory: %CD%
echo Running npm run dev...
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
