#!/bin/bash
# Builds a release-signed LastRepEasy.apk on this Mac (no Expo account needed).
# Usage: scripts/build-apk.sh   (release builds use PROD_URL from src/api/client.ts)
set -euo pipefail
cd "$(dirname "$0")/.."

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export PATH="$JAVA_HOME/bin:$PATH"

# One signing key for every build, kept outside the repo. Lose it and phones can't update the app in place.
KDIR="$HOME/.lastrepeasy"; KS="$KDIR/lastrepeasy-release.jks"; KP="$KDIR/keystore.properties"
if [ ! -f "$KS" ]; then
  mkdir -p "$KDIR"; chmod 700 "$KDIR"
  PASS="$(openssl rand -hex 16)"
  keytool -genkeypair -v -keystore "$KS" -alias lastrepeasy -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$PASS" -keypass "$PASS" -dname "CN=LastRepEasy, O=LastRepEasy, C=IN" >/dev/null
  printf 'storePassword=%s\nkeyPassword=%s\nkeyAlias=lastrepeasy\n' "$PASS" "$PASS" > "$KP"; chmod 600 "$KP" "$KS"
fi
PASS="$(grep ^storePassword "$KP" | cut -d= -f2)"

[ -d android ] || CI=1 npx expo prebuild --platform android --no-install
python3 - <<'PY'
import re
p="android/app/build.gradle"; s=open(p).read()
if "signingConfigs.release" not in s:
    s=s.replace("    signingConfigs {\n","    signingConfigs {\n        release {\n            storeFile file(System.getenv('LRE_KS'))\n            storePassword System.getenv('LRE_PASS')\n            keyAlias 'lastrepeasy'\n            keyPassword System.getenv('LRE_PASS')\n        }\n",1)
    s=re.sub(r"(release \{\n\s*//[^\n]*\n\s*//[^\n]*\n\s*)signingConfig signingConfigs\.debug",r"\1signingConfig signingConfigs.release",s,1)
    open(p,"w").write(s)
PY
sed -i '' 's/^reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a,armeabi-v7a/' android/gradle.properties
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

(cd android && LRE_KS="$KS" LRE_PASS="$PASS" ./gradlew assembleRelease --no-daemon)
cp android/app/build/outputs/apk/release/app-release.apk "$HOME/Desktop/LastRepEasy.apk"
echo "Built: $HOME/Desktop/LastRepEasy.apk"
