#!/usr/bin/env bash
set -e

echo ">>> [1/4] React install..."
cd frontend/react
npm install --legacy-peer-deps
echo ">>> [2/4] React build..."
npm run build
cd ../..

echo ">>> [3/4] Static faylları kopyala..."
mkdir -p static/js/spa
cp -r frontend/react/dist/. static/js/spa/

echo ">>> [4/4] collectstatic..."
python manage.py collectstatic --noinput

echo ">>> staticfiles yoxlanir..."
ls -la staticfiles/ && echo "OK" || echo "XETA: staticfiles/ tapilmadi"

echo ">>> Build tamamlandi."
