FROM node:20-alpine AS frontend-builder

WORKDIR /app
ARG NPM_REGISTRY=https://registry.npmjs.org/

COPY frontend/react/package.json frontend/react/package-lock.json ./
RUN npm config set registry ${NPM_REGISTRY} && \
    npm config set fetch-retries 8 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 180000 && \
    npm config set fetch-timeout 300000 && \
    npm config set audit false && \
    npm config set fund false && \
    npm install --legacy-peer-deps

COPY frontend/react .
RUN npm run build

FROM python:3.12-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

COPY . .

# Copy built frontend bundle from builder stage
COPY --from=frontend-builder /app/dist /app/static/js/spa

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

FROM node:20-alpine AS frontend

WORKDIR /usr/src/app
ARG NPM_REGISTRY=https://registry.npmjs.org/

COPY frontend/react/package.json .
RUN npm config set registry ${NPM_REGISTRY} && \
    npm config set fetch-retries 8 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 180000 && \
    npm config set fetch-timeout 300000 && \
    npm config set audit false && \
    npm config set fund false && \
    for i in 1 2 3; do npm install --legacy-peer-deps && break || (echo "npm install failed, retry $i/3" && sleep 5); done

COPY frontend/react .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]