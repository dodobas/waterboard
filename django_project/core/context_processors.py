

def expose_settings(request):
    from django.conf import settings
    return {'platform_env': settings.PLATFORM_ENV}
