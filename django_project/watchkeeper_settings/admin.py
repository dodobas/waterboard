__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

# coding=utf-8
# from django.db.utils import ProgrammingError
from django.contrib.gis import admin
from django.contrib.auth.admin import UserAdmin

from watchkeeper_settings.models.watchkeeper_settings import WatchkeeperSettings


class WatchkeeperSettingsAdmin(admin.ModelAdmin):

    def has_delete_permission(self, request, *args, **kwargs):
        return False

    def has_add_permission(self, request, *args, **kwargs):
        return False if self.model.objects.count() > 0 else True


admin.site.register(WatchkeeperSettings, WatchkeeperSettingsAdmin)

# try:
#     if not WatchkeeperSettings.objects.all():
#         settings = WatchkeeperSettings()
#         settings.save()
# except ProgrammingError:
#     pass
