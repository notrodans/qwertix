#!/usr/bin/env sh
set -e

# 1. Try to get token from Docker Secret
if [ -f /run/secrets/doppler_token ]; then
    export DOPPLER_TOKEN=$(cat /run/secrets/doppler_token)
fi

# 2. Construct DATABASE_URL from secrets if not present (and not using Doppler to fetch it)
# We do this before Doppler run, but Doppler run will overwrite it if it fetches DATABASE_URL.
# If no Doppler token, this allows running with Docker Secrets.
if [ -z "$DATABASE_URL" ] && [ -z "$DOPPLER_TOKEN" ]; then
    if [ -f /run/secrets/db_user ] && [ -f /run/secrets/db_password ] && [ -f /run/secrets/db_name ]; then
        echo "🔧 Constructing DATABASE_URL from secrets..."
        DB_USER=$(cat /run/secrets/db_user)
        DB_PASS=$(cat /run/secrets/db_password)
        DB_NAME=$(cat /run/secrets/db_name)
        DB_HOST=${DB_HOST:-db}
        DB_PORT=${DB_PORT:-8763}
        export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
    fi
fi

# 3. If token is present, use Doppler
if [ -n "$DOPPLER_TOKEN" ]; then
    echo "🚀 Starting with Doppler secrets..."
    exec doppler run -- "$@"
else
    echo "✅ Starting with local environment..."
    exec "$@"
fi