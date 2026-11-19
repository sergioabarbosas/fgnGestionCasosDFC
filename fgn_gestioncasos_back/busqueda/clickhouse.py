import os
import clickhouse_connect

from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

environ.Env.read_env(BASE_DIR / ".env")

def get_client():
    return clickhouse_connect.get_client(
        host=env("CLICKHOUSE_HOST"),
        port=env.int("CLICKHOUSE_PORT", default=8123),
        username=env("CLICKHOUSE_USER"),
        password=env("CLICKHOUSE_PASSWORD"),
        database=env("CLICKHOUSE_DB"),
    )