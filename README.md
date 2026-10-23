React Frontend
|
Django API
|
MySQL <- sistema fuente
ClickHouse OSS <- búsquedas, logs, auditoría, analítica
Redis/Celery <- procesos async

docker compose exec clickhouse clickhouse-client
SHOW DATABASES;

docker compose restart web

Acción	| Método y ruta
Crear usuario |	POST /api/auth/register/
Login |	POST /api/auth/login/
Cambiar contraseña	| POST /api/auth/change-password/
Sign out	| POST /api/auth/logout/
Usuario actual	| GET /api/auth/me/


curl -X POST http://localhost:8050/api/auth/register/ -H "Content-Type: application/json" -d "{\"username\":\"prueba\",\"password\":\"ClaveSegura#2026\"}"
curl -c cookies.txt -X POST http://localhost:8050/api/auth/login/ -H "Content-Type: application/json" -d "{\"username\":\"prueba\",\"password\":\"ClaveSegura#2026\"}"