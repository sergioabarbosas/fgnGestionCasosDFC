React Frontend
|
Django API
|
MySQL <- sistema fuente
ClickHouse OSS <- búsquedas, logs, auditoría, analítica
Redis/Celery <- procesos async

docker compose exec clickhouse clickhouse-client
SHOW DATABASES;