#!/usr/bin/env bash
set -e

echo ">>> React build..."
cd frontend/react
npm install --legacy-peer-deps
npm run build
cd ../..

echo ">>> Django static faylları kopyalanır..."
mkdir -p static/js/spa
cp -r frontend/react/dist/. static/js/spa/

echo ">>> collectstatic..."
python manage.py collectstatic --noinput

echo ">>> Build tamamlandı."
