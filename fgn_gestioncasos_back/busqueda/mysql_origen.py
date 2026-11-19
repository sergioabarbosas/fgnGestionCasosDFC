import os
import pymysql
from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

environ.Env.read_env(BASE_DIR / ".env")

def get_origen_conn():
    return pymysql.connect(
        host=env("CASOS_DB_HOST"),
        port=env.int("MYSQL_PORT", default=3306),
        user=env("MYSQL_USER"),
        password=env("MYSQL_PASSWORD"),
        database=env("MYSQL_DATABASE"),
        charset="utf8mb4",
        connect_timeout=10,
        read_timeout=300,
        cursorclass=pymysql.cursors.Cursor,
        autocommit=True,
    )