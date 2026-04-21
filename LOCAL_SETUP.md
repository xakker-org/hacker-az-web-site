# Local Development Setup: Xakker Multi-Domain Configuration

## Add to /etc/hosts

To test the application locally with domain routing, add these lines to your `/etc/hosts` file:

```
127.0.0.1   xakker.org
127.0.0.1   www.xakker.org
127.0.0.1   self-study.xakker.org
127.0.0.1   localhost.xakker.org
```

### On Linux/macOS:

```bash
sudo nano /etc/hosts
# Add the lines above, then save with Ctrl+X, Y, Enter
```

### On Windows:

```
C:\Windows\System32\drivers\etc\hosts
# Open with Notepad as Administrator, add the lines above
```

## Running Locally

### Option 1: Standard Django Development Server

```bash
cd /home/maharrammasimov/hacker-az-web-site
.venv/bin/python manage.py runserver 0.0.0.0:8000
```

Then access:
- **Landing Page**: http://xakker.org:8000
- **Platform Page**: http://self-study.xakker.org:8000

### Option 2: Using Docker Compose

```bash
docker compose up --build
```

This will start:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## Domain Routing

- `xakker.org` → Landing Page (django-hosts routes to `config.urls_landing`)
- `self-study.xakker.org` → Platform Dashboard (django-hosts routes to `config.urls_platform`)
- `localhost`, `127.0.0.1` → Platform Dashboard (default fallback)

## Architecture

- **config/hosts.py**: Django-hosts domain routing rules
- **config/urls_landing.py**: URL patterns for xakker.org
- **config/urls_platform.py**: URL patterns for self-study.xakker.org (main API and admin)
- **config/settings.py**: Updated with django-hosts middleware and ROOT_HOSTCONF

## Testing Domain Routing

```bash
# Check if domains are reachable
curl http://xakker.org:8000/api/health/
curl http://self-study.xakker.org:8000/api/health/
```

Each will return the domain they're routing to.
