"""
ASGI config for jengaest project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jengaest.settings')

application = get_asgi_application()



