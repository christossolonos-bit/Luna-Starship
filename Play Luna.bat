@echo off
setlocal EnableDelayedExpansion

set "PORT=8080"
cd /d "%~dp0"

set "LAN_IP="
for /f "usebackq tokens=2 delims=:" %%a in (`ipconfig ^| findstr /c:"IPv4"`) do (
  if not defined LAN_IP set "LAN_IP=%%a"
)
if defined LAN_IP set "LAN_IP=!LAN_IP: =!"

echo.
echo  Luna Starship
echo  =============
echo.
echo  This PC:      http://localhost:%PORT%
if defined LAN_IP (
  echo  Same WiFi:    http://!LAN_IP!:%PORT%
) else (
  echo  Same WiFi:    run ipconfig to find your IPv4 address
)
echo.
echo  Share the "Same WiFi" link with a friend on your network.
echo  For friends on the internet, use a tunnel or GitHub Pages.
echo.
echo  Press Ctrl+C to stop the server.
echo.

start "" "http://localhost:%PORT%"
python -m http.server %PORT% --bind 0.0.0.0
