from django.contrib import admin
from sms.models import Gateway, Message, Reply

class GatewayAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_url')
    
    fieldsets = (
        (None, {'fields': [
            'name',
            'base_url',
            'settings',
        ]}),
        ('Sending parameters', {'fields': [
            'recipient_keyword',
            'content_keyword',
            'uuid_keyword',
        ]}),
        ('Response handling', {'fields': [
            ('success_format', 'status_mapping'),
            'error_format',
            'charge_keyword',
        ]}),
        ('Status callback handling', {'fields': [
            ('status_msg_id', 'status_status'),
            ('status_date', 'status_date_format'),
        ]}),
        ('Reply handling', {'fields': [
            'reply_content',
            'reply_sender',
            ('reply_date', 'reply_date_format'),
        ]}),
        ('Check number handling', {'fields': [
            ('check_number_url','check_number_field',),
            ('check_number_response_format', 'check_number_status_mapping'),
        ]}),
        ('Balance inquriy', {'fields': [
            ('query_balance_url', 'query_balance_params'),
            'query_balance_response_format',
        ]})
    )

class MessageAdmin(admin.ModelAdmin):
    list_display = (
        'recipient_number', 
        'status', 
        'sender', 
        'local_send_time',
        'billed',
        'gateway',
        'gateway_charge',
        'billee'
    )
    list_filter = (
        'status',
        'billed',
        'gateway'
    )
    search_fields = (
        'recipient_number',
        'content',
    )
    raw_id_fields = ('sender', 'content_type')

class ReplyAdmin(admin.ModelAdmin):
    list_display = ()
    
admin.site.register(Gateway, GatewayAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Reply, ReplyAdmin)
