"""This is the entry point for gunicron with `docker compose up`"""
from flask import Flask

app = Flask(__name__)


def import_routes():
    """Required so formatter does not pull import to top of file"""
    from app import routes
    return routes


import_routes()
