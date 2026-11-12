@echo off
chcp 65001 >nul
title Hamoksha Advertising - Local Launcher

echo ==================================================
echo   Hamoksha Advertising - Local Website Launcher
echo ==================================================
echo.

where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting local web server on http://localhost:4173 ...
  start "" "http://localhost:4173"
  npx --yes vite preview --port 4173 --host 127.0.0.1
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting Python local server on http://localhost:4173 ...
  start "" "http://localhost:4173"
  python -m http.server 4173
  goto :eof
)

echo Opening index.html directly in your default browser...
start "" "%~dp0index.html"
