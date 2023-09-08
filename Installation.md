
# Setup & Install on Ubuntu 22.04.2

## Setup Python Virtual Environment

Install virtual environment in folder .venv in the project folder  

```
$ cd /Project-3
$ python3 -m venv .venv
```
add .venv and .venv/\*.* to .gitignore

## Start virtual environment

```
$ source .venv/bin/activate
```


## install necessary packages

```
(.venv)$ pip3 install django
(.venv)$ pip3 install python-decouple
(.venv)$ pip3 install whitenoise
```

## Creating Django Project and App

```
(.venv)$ cd .../Project-3/
(.venv)$ django-admin startproject Project3
(.venv)$ cd Project3
(.venv)$ python3 manage.py startapp mail 
```

## Configure DEFAULT_AUTO_FIELD

Open Apps.py  
Edit the AppConfig thusly
```
from django.apps import AppConfig

class MailConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mail'
```
or open settings.py and define it thusly
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```

## Make Migrations

Always include the app name when making migrations

```
(.venv)$ python3 manage.py makemigrations mail
(.venv)$ python3 manage.py migrate
(.venv)$ python3 manage.py runserver
```

# Install Django Debug Toolbar

```
(.venv)$ install django-debug-toolbar
```

Open settings.py  

add 'debug_toolbar' to the INSTALLED_APPS list:
```
INSTALLED_APPS = [
   # ...
   'debug_toolbar',
   # ...
]
```

Configure Middleware: Still in your settings.py, add the DebugToolbarMiddleware to the MIDDLEWARE list. Place it as early as possible so that it can capture and display relevant debug information:

```
MIDDLEWARE = [
   'debug_toolbar.middleware.DebugToolbarMiddleware',
   # ...
]
```

Configure Internal IPs: You'll need to specify internal IP addresses that can access the debug toolbar. Add the following to your settings.py:
```
INTERNAL_IPS = [
   # '127.0.0.1',  # example IP, add your own IPs here
   # ...
]
```

URL Configuration: To enable the debug toolbar, you need to add its URL configuration to your project's urls.py. Import the toolbar's functions at the top of the file and then include the toolbar URLs:

```
from django.urls import include

# ...

if settings.DEBUG:
   import debug_toolbar
   urlpatterns = [
       path('__debug__/', include(debug_toolbar.urls)),
       # ...
   ] + urlpatterns
```


# Live Mail Servers








   
