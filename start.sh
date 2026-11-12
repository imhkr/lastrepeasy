#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
MOBILE_DIR="$ROOT_DIR/mobile"

echo "========================================================"
echo "  FormFlow AI — Starting Backend API + Android/Expo App "
echo "========================================================"

# Cleanup background processes on Ctrl+C / exit
BACKEND_PID=""
cleanup() {
  echo ""
  echo "Stopping FormFlow AI services..."
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# 1. Setup & Start FastAPI Backend
echo "[1/2] Setting up Python Backend in $BACKEND_DIR ..."
cd "$BACKEND_DIR"

PYTHON_BIN="/opt/homebrew/bin/python3.12"
if [[ ! -x "$PYTHON_BIN" ]]; then
  PYTHON_BIN="$(command -v python3)"
fi

if [[ ! -d ".venv" ]]; then
  if command -v uv >/dev/null 2>&1; then
    uv venv .venv --python "$PYTHON_BIN"
  else
    "$PYTHON_BIN" -m venv .venv
  fi
fi

if command -v uv >/dev/null 2>&1; then
  uv pip install --python "$BACKEND_DIR/.venv/bin/python" -r requirements.txt
else
  "$BACKEND_DIR/.venv/bin/pip" install -r requirements.txt
fi

# Detect LAN IP so physical Android phones on Wi-Fi can also reach the backend
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")"
export PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://$LAN_IP:8000}"

echo "Starting FastAPI server at http://0.0.0.0:8000 (LAN URL: $PUBLIC_BASE_URL) ..."
PYTHONPATH="$BACKEND_DIR" "$BACKEND_DIR/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait briefly for backend health check
sleep 2
echo "Backend running (PID: $BACKEND_PID)"

# 2. Setup & Start React Native (Expo SDK 58) Mobile App
echo ""
echo "[2/2] Starting React Native (Expo SDK 58) App in $MOBILE_DIR ..."
cd "$MOBILE_DIR"

# Ensure Expo SDK 58, expo-video, expo-speech, and async-storage 2.2.0 are installed
INSTALLED_EXPO_VER="$(node -p "try { require('./node_modules/expo/package.json').version } catch(e) { '' }")"
INSTALLED_AS_VER="$(node -p "try { require('./node_modules/@react-native-async-storage/async-storage/package.json').version } catch(e) { '' }")"
if [[ ! "$INSTALLED_EXPO_VER" =~ ^58\. ]] || [[ "$INSTALLED_AS_VER" != "2.2.0" ]] || [[ ! -d "node_modules/expo-video" ]] || [[ ! -d "node_modules/expo-speech" ]]; then
  echo "Upgrading / syncing mobile npm packages to Expo SDK 58..."
  npm install --legacy-peer-deps
fi

export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://$LAN_IP:8000}"
echo "Using EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"
echo "Tip: Scan the QR code with Expo Go (SDK 58) or press 'a' for Android / 'w' for Web."
echo ""

npx expo start -c
