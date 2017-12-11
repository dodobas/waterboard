# coding=utf-8
from django.contrib.gis import admin
from django.contrib.auth.admin import UserAdmin
from event_mapper.forms.user import UserCreationForm, UserChangeForm
from event_mapper.models.user import User
from event_mapper.models.country import Country
from event_mapper.models.province import Province
from event_mapper.models.event import Event
from event_mapper.models.event_type import EventType
from event_mapper.models.perpetrator import Perpetrator
from event_mapper.models.victim import Victim
from event_mapper.models.movement import Movement
from event_mapper.models.rating import Rating
from event_mapper.models.daily_report import DailyReport


class MyUserAdmin(UserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = (
        'email', 'first_name', 'last_name', 'is_admin', 'is_staff',
        'is_data_captor', 'is_active', 'notified',
        'is_confirmed')
    list_filter = (
        'is_admin', 'is_staff', 'is_data_captor', 'is_active',
        'countries_notified', 'notified', 'is_confirmed')
    fieldsets = (
        ('Credentials', {'fields': (
            'email', 'password', 'is_active', 'key', 'is_confirmed')}),
        ('Personal info', {'fields': (
            'first_name', 'last_name', 'phone_number')}),
        ('Permissions', {'fields': (
            'is_admin', 'is_staff', 'is_data_captor')}),
        ('Notification', {'fields': (
            'countries_notified', 'notified')}),
        ('Area of Interest', {'fields': (
            'north', 'east', 'south', 'west')}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        ('Credentials', {'fields': (
            'email', 'password1', 'password2', 'is_active', 'is_confirmed')}),
        ('Personal info', {'fields': (
            'first_name', 'last_name', 'phone_number')}),
        ('Permissions', {'fields': (
            'is_admin', 'is_staff', 'is_data_captor')}),
        ('Notification', {'fields': (
            'countries_notified', 'notified')}),
        ('Area of Interest', {'fields': (
            'north', 'east', 'south', 'west')}),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()


class BoundaryAdmin(admin.OSMGeoAdmin):
    pass


class EventAdmin(admin.OSMGeoAdmin):
    list_display = (
        'category', 'place_name', 'date_time', 'type', 'perpetrator',
        'victim', 'notified_immediately', 'notification_sent', 'reported_by')
    list_filter = (
        'category', 'type', 'perpetrator', 'victim', 'notified_immediately',
        'notification_sent', 'reported_by',)
    ordering = ('date_time',)
    search_fields = ('reported_by',)


class EventTypeAdmin(admin.ModelAdmin):
    pass


class PerpetratorAdmin(admin.ModelAdmin):
    pass


class VictimAdmin(admin.ModelAdmin):
    pass


class MovementAdmin(admin.OSMGeoAdmin):
    actions = None
    list_display = (
        'boundary', 'risk_level', 'movement_state', 'notified_immediately',
        'notification_sent', 'last_updater', 'last_updated_time')

    list_filter = (
        'risk_level', 'movement_state', 'notified_immediately',
        'notification_sent', 'last_updater', 'last_updated_time',)

    fieldsets = (
        ('Information', {'fields': (
            'boundary', 'risk_level', 'movement_state',
            'notes')}),
        ('Notification', {'fields': (
            'notified_immediately', 'notification_sent',)}),
        ('Update', {'fields': ('last_updated_time',)}),
    )

    readonly_fields = ('last_updated_time', 'last_updater', 'boundary')

    def save_model(self, request, obj, form, change):
        obj.last_updater = request.user
        obj.save()


class RatingAdmin(admin.ModelAdmin):
    list_display = ('label', 'level')
    ordering = ('level',)


class DailyReportAdmin(admin.ModelAdmin):
    list_display = ('date_time', 'event_number', 'movement_number')
    ordering = ('date_time',)


admin.site.register(User, MyUserAdmin)
admin.site.register(Country, BoundaryAdmin)
admin.site.register(Province, BoundaryAdmin)
# admin.site.register(Event, EventAdmin)
# admin.site.register(EventType, EventTypeAdmin)
# admin.site.register(Perpetrator, PerpetratorAdmin)
# admin.site.register(Victim, VictimAdmin)
# admin.site.register(Movement, MovementAdmin)
# admin.site.register(Rating, RatingAdmin)
# admin.site.register(DailyReport, DailyReportAdmin)
