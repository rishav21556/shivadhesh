from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import reverse
from jinja2 import Environment


def environment(**options):
    """
    Custom Jinja2 environment configuration for Django.
    """
    env = Environment(**options)
    
    # Add Django's static and url functions to Jinja2
    env.globals.update({
        'static': staticfiles_storage.url,
        'url': reverse,
    })
    
    # Add custom filters here if needed
    # env.filters['custom_filter'] = your_custom_filter
    
    return env
