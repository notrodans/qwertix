#!/usr/bin/env sh
set -e

if [ -f /run/secrets/doppler_token ]; then
    DOPPLER_BIN=""
    if command -v doppler >/dev/null 2>&1; then
        DOPPLER_BIN=$(command -v doppler)
    elif [ -x "/usr/bin/doppler" ]; then
        DOPPLER_BIN="/usr/bin/doppler"
    elif [ -x "/usr/local/bin/doppler" ]; then
        DOPPLER_BIN="/usr/local/bin/doppler"
    fi

    if [ -n "$DOPPLER_BIN" ]; then
        cat /run/secrets/doppler_token | doppler configure set token --scope / > /dev/null
    else
        echo "❌ Error: doppler CLI not found even though doppler_token is provided." echo "DEBUG: PATH=$PATH" echo "DEBUG: pwd=$(pwd)"
        echo "DEBUG: ls /usr/bin/doppler=$(ls -l /usr/bin/doppler 2>/dev/null || echo "not found")"
        exit 1
    fi
fi

# STUPID CRUTCH
if [ -d "./dist" ] && [ "$1" = "bun" ] && [ "$3" = "sirv" ]; then
    echo "Creating runtime environment configuration..."
    doppler run -- sh -c 'cat <<EOF > ./dist/env-config.js
globalThis._env_ = {
  VITE_API_URL: "$VITE_API_URL",
  VITE_WS_URL: "$VITE_WS_URL",
  VITE_RESULT_HASH_SALT: "$RESULT_HASH_SALT"
};
EOF'
    echo "✅ Generated ./dist/env-config.js"
fi

# 3. Execute the command
exec doppler run -- "$@"
