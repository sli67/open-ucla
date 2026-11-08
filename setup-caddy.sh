#!/usr/bin/env bash
# Set up Caddy as an HTTPS reverse proxy in front of the open-ucla app.
# Run on the EC2 instance from the repo root:  sudo ./setup-caddy.sh
#
# Before running (manual, in Cloudflare):
#   - A record for $DOMAIN -> this instance's public IP
#   - SSL/TLS > Edge Certificates > "Always Use HTTPS" OFF until the cert is issued
# AWS security group must allow inbound 80 and 443.

set -euo pipefail

DOMAIN="${DOMAIN:-sli67.dev}"
APP_PORT="${APP_PORT:-3000}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo $0" >&2
  exit 1
fi

echo "==> 1/4 Installing Caddy"
if ! command -v caddy >/dev/null 2>&1; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gnupg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
else
  echo "    already installed: $(caddy version)"
fi

echo "==> 2/4 Moving the app to port $APP_PORT (Caddy needs 80/443)"
sed -E "s/-p [0-9]+/-p $APP_PORT/" "$REPO_DIR/open-ucla.service" \
  > /etc/systemd/system/open-ucla.service
systemctl daemon-reload
systemctl enable open-ucla
systemctl restart open-ucla

echo "==> 3/4 Writing /etc/caddy/Caddyfile"
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    reverse_proxy localhost:$APP_PORT
}
EOF
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

echo "==> 4/4 Starting Caddy (it will request the Let's Encrypt certificate)"
systemctl enable caddy
systemctl restart caddy

echo "    waiting for certificate..."
for _ in $(seq 1 30); do
  if journalctl -u caddy --since "-2min" --no-pager | grep -q "certificate obtained successfully"; then
    echo "    certificate obtained for $DOMAIN"
    break
  fi
  sleep 2
done

journalctl -u caddy --since "-2min" --no-pager | grep -E "certificate|error" | tail -5 || true

cat <<EOF

Done. Next (manual, in Cloudflare):
  - SSL/TLS mode -> Full (strict)
  - Turn "Always Use HTTPS" back on if you want it
If the cert failed: set the A record to "DNS only" (grey cloud),
run 'sudo systemctl restart caddy', then re-enable the proxy.

Check:  curl -I https://$DOMAIN
Logs:   journalctl -u caddy -f   |   journalctl -u open-ucla -f
EOF
