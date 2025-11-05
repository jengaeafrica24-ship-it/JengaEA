"""
WSGI config for jengaest project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jengaest.settings')

application = get_wsgi_application()



