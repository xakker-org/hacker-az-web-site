import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.core.management import call_command
call_command("migrate", "--no-input", verbosity=0)
call_command("create_superuser_if_none", verbosity=0)

from config.wsgi import application

handler = application
