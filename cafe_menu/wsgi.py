"""
WSGI config for cafe_menu project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
import sys

# Add your project directory to the sys.path
project_home = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_home not in sys.path:
    sys.path.append(project_home)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafe_menu.settings')

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
