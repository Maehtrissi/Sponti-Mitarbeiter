FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:crm

FROM python:3.12-slim
WORKDIR /app
COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
COPY server ./server
COPY --from=frontend /app/dist ./dist
RUN useradd --create-home --uid 10001 crm && mkdir /data && chown crm:crm /data
USER crm
ENV CRM_DATABASE=/data/crm.sqlite
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "server.app:create_app()"]
