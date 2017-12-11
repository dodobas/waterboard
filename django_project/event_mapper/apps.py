# coding=utf-8
"""This allows us a place to import signals when the app is ready avoiding
circular imports etc."""
__author__ = 'Christian Christelis <christian@kartoza.com>'
__project_name = 'watchkeeper'
__filename = 'apps'
__date__ = '18/06/15'


from django.apps import AppConfig


class EventMapperAppConfig(AppConfig):
    name = 'event_mapper'

    def ready(self):
        import event_mapper.signals