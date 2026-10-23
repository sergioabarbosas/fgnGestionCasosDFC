# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.

import pymysql

pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()


from .celery import app as celery_app

__all__ = ('celery_app',)