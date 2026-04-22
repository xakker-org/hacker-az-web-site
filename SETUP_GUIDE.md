# Xakker.org Premium Design System - Complete Setup Guide

## 🎯 Architecture Overview

- **Backend**: Django + Django REST Framework + django-hosts
- **Frontend**: React + Vite
- **Multi-domain Routing**: xakker.org (Landing) + self-study.xakker.org (Platform)
- **Database**: SQLite (local) / PostgreSQL (production)

---

## 📋 Quick Start

### 1. Install Python Dependencies

```bash
cd /home/maharrammasimov/hacker-az-web-site
.venv/bin/pip install -r requirements.txt
```

### 2. Install Node Dependencies

```bash
cd frontend/react
npm install
```

### 3. Set Up /etc/hosts (Local Development)

Add these entries to `/etc/hosts`:

```
127.0.0.1   xakker.org
127.0.0.1   www.xakker.org
127.0.0.1   self-study.xakker.org
127.0.0.1   localhost.xakker.org
```

**On Linux/macOS:**
```bash
echo "127.0.0.1 xakker.org" | sudo tee -a /etc/hosts
echo "127.0.0.1 self-study.xakker.org" | sudo tee -a /etc/hosts
```

**On Windows (PowerShell as Admin):**
```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 xakker.org"
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 self-study.xakker.org"
```

---

## 🚀 Running Locally

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd /home/maharrammasimov/hacker-az-web-site
.venv/bin/python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
cd /home/maharrammasimov/hacker-az-web-site/frontend/react
npm run dev
```

**Access:**
- Landing Page: http://xakker.org:8000
- Platform Auth: http://self-study.xakker.org:8000
- API: http://localhost:8000/api
- Frontend Dev: http://localhost:5173

---

### Option 2: Docker Compose (Full Stack)

```bash
cd /home/maharrammasimov/hacker-az-web-site
docker compose up --build
```

**Access via Docker:**
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## 🔍 Testing Domain Routing

### Check Health Endpoints

```bash
# Landing domain (xakker.org)
curl http://xakker.org:8000/api/health/

# Platform domain (self-study.xakker.org)
curl http://self-study.xakker.org:8000/api/health/

# Response should indicate which domain it's routing to
```

### Verify django-hosts Configuration

```bash
# Test URL resolution
python manage.py shell
>>> from django.urls import resolve
>>> from django.test.client import Client
>>> # Should use urls_landing for xakker.org
>>> # Should use urls_platform for self-study.xakker.org
```

---

## 📁 Project Structure

```
hacker-az-web-site/
├── config/
│   ├── hosts.py              # Django-hosts routing rules
│   ├── urls_landing.py       # Landing page URLs (xakker.org)
│   ├── urls_platform.py      # Platform URLs (self-study.xakker.org)
│   ├── settings.py           # Updated with django-hosts config
│   ├── wsgi.py
│   └── asgi.py
├── accounts/                 # User authentication
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── courses/                  # Course management
│   ├── models.py
│   ├── views.py
│   └── urls.py
├── frontend/react/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Premium landing (xakker.org)
│   │   │   ├── AuthPage.jsx         # Login/Register
│   │   │   ├── DashboardPage.jsx    # Student dashboard
│   │   │   └── ExamAttemptPage.jsx  # Exam attempt workflow
│   │   ├── styles/
│   │   │   ├── app.css              # Premium design system
│   │   │   ├── landing.css
│   │   │   ├── auth.css
│   │   │   ├── dashboard.css
│   │   │   └── exam.css
│   │   ├── services/
│   │   │   └── api.js               # Axios config + JWT handling
│   │   ├── utils/
│   │   │   └── tokens.js            # Token storage
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── static/                    # Django static assets
│   ├── logo/
│   │   └── logoXakker.png
│   ├── css/
│   │   └── landing.css
│   └── js/
│       ├── landing.js
│       └── spa/
│           ├── app.js
│           └── app.css
├── docker-compose.yml
├── requirements.txt
├── LOCAL_SETUP.md             # This file
└── manage.py
```

---

## 🎨 Design System

### Colors
- **Black Base**: #0b0b0b
- **Deep Navy**: #0f172a
- **Neon Blue**: #00c2ff (Defense/Security)
- **Cyber Red**: #ff2d55 (Offense/Attack)
- **Text Primary**: #f4fbff
- **Text Secondary**: #a0b2c8

### Typography
- **Display Font**: Space Grotesk (headlines)
- **Body Font**: Inter (content)
- **Font Weights**: 400, 500, 600, 700, 800, 900

### Components
- Premium cards with glassmorphism
- Smooth gradient buttons
- Animated backgrounds with iridescence effect
- Responsive grid layouts
- Dark mode throughout

---

## 🔐 Authentication Flow

1. User lands on **xakker.org** → Landing Page (public)
2. User clicks "Start Learning" → Redirects to **self-study.xakker.org/auth**
3. User logs in → JWT tokens stored in localStorage
4. Dashboard redirects to **self-study.xakker.org/dashboard**
5. Backend validates JWT for protected routes
6. Token refresh handled automatically by axios interceptor

---

## 🐳 Docker Compose Services

### Database (PostgreSQL)
- **Service**: `db`
- **Port**: 5432
- **Credentials**: set in docker-compose.yml

### Backend (Django)
- **Service**: `backend`
- **Port**: 8000
- **Command**: `python manage.py migrate && python manage.py runserver 0.0.0.0:8000`
- **Auto-migrations**: Yes

### Frontend (React + Vite)
- **Service**: `frontend`
- **Port**: 5173
- **Volume**: Hot reload enabled

---

## 🧪 Testing Workflow

### 1. Backend Tests
```bash
python manage.py test
```

### 2. Check Migrations
```bash
python manage.py showmigrations
python manage.py migrate
```

### 3. Create Superuser (if needed)
```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@xakker.org
# Password: ••••••••
```

### 4. Test API Endpoints
```bash
# Register
curl -X POST http://self-study.xakker.org:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@xakker.org","password":"secure123"}'

# Login
curl -X POST http://self-study.xakker.org:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"secure123"}'

# Get User Info (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://self-study.xakker.org:8000/api/auth/me/
```

---

## 🛠️ Troubleshooting

### Django won't start
```bash
# Clear migrations
python manage.py migrate --zero

# Check configuration
python manage.py check

# Verify settings
python -c "from django.conf import settings; print(settings.ROOT_HOSTCONF)"
```

### Frontend blank screen
```bash
# Clear node modules and reinstall
cd frontend/react
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf frontend/react/.vitepress

# Start fresh
npm run dev
```

### Domain routing not working
```bash
# Verify /etc/hosts entries
cat /etc/hosts | grep xakker

# Test DNS resolution
nslookup xakker.org
ping xakker.org

# Clear browser cache and cookies
```

### CORS errors
```bash
# Ensure CORS_ALLOWED_ORIGINS includes frontend URL
# In settings.py:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://xakker.org:5173",
    "http://self-study.xakker.org:5173",
]
```

---

## 📚 Key Features

✅ **Multi-Domain Routing**: xakker.org + self-study.xakker.org
✅ **Premium UI/UX**: Modern 2026 SaaS design
✅ **JWT Authentication**: Secure token-based auth
✅ **Glassmorphism**: Modern frosted-glass effects
✅ **Responsive Design**: Mobile, tablet, desktop
✅ **Animated Backgrounds**: Subtle iridescence effect
✅ **Dark Mode**: Elite cybersecurity aesthetic
✅ **Docker Ready**: One-command deployment

---

## 🚢 Production Deployment

### Before Production:
1. Set `DEBUG = False` in settings.py
2. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
3. Use PostgreSQL instead of SQLite
4. Set strong `SECRET_KEY`
5. Enable HTTPS/SSL
6. Use a production WSGI server (Gunicorn)
7. Set up proper logging and monitoring
8. Run `python manage.py collectstatic`

### Production Docker:
```bash
docker compose -f docker-compose.prod.yml up
```

---

## 📞 Support

For issues or questions:
- Check Django logs: `backend` service in docker-compose
- Check frontend console: Browser DevTools
- Review network requests: Network tab in DevTools
- Test with `curl` for API debugging

---

**Last Updated**: April 20, 2026
**Version**: 1.0.0 - Premium Design System
