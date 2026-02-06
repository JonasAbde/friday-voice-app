# DEPLOYMENT.md

## Cloudflare Tunnel Setup

**Problem:** Cloudflare Tunnel crashes periodically (no uptime guarantee on free tier)

**Solution:** Installed cloudflared permanently on VPS

### Installation (one-time):
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
export PATH="/usr/local/sbin:/usr/sbin:/sbin:$PATH"
dpkg -i cloudflared-linux-amd64.deb
```

### Start Tunnel:
```bash
cloudflared tunnel --url http://localhost:8765
```

### Current URL:
https://practices-defendant-edward-protocols.trycloudflare.com

**Note:** URL changes on every restart (free tier limitation)

### TODO: Production Setup
- [ ] Create named Cloudflare Tunnel (permanent URL)
- [ ] Setup systemd service for auto-restart
- [ ] Configure DNS (friday.tekup.dk?)
- [ ] Add health monitoring + auto-recovery
