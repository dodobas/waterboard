import urllib
import datetime
import logging
import re
import unicodedata

from django.conf import settings
from django.db import models
from django.utils.translation import ugettext as _

import jsonfield.fields

class Gateway(models.Model):
    """
    A Gateway is a sending endpoint, and associated authentication info
    that can be used to send and receive messages.
    """
    
    name = models.CharField(max_length=128, unique=True)
    
    # These fields are used in the request to send a message via a gateway.
    base_url = models.URLField()
    settings = jsonfield.fields.JSONField(default={},
        help_text=_(u'A JSON Dictionary of key-value pairs that will be '
            'used for every message. Authorisation credentials should go '
            'in here, for example.'
        ))
    recipient_keyword = models.CharField(max_length=128,
        help_text=_(u'The keyword that is used in the request to identify the recipient number.')
    )
    content_keyword = models.CharField(max_length=128,
        help_text=_(u'The keyword that is used in the request to identify the message content.')
    )
    uuid_keyword = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'The keyword used in the request for our message reference id.')
    )
    
    # These fields are used to parse the response for status/charge info
    success_format = models.CharField(max_length=256, null=True, blank=True,
        help_text=_(u'A regular expression that parses the response. May contain named groups for "gateway_message_id", "status_message" and "status_code".'))
    error_format = models.CharField(max_length=256, null=True, blank=True,
        help_text=_(u'A regular expression that parses an error response. Must contain named group for "status_message".')
    )
    status_mapping = jsonfield.JSONField(default={},
        help_text=_(u"A mapping of returned status codes to our status choices. These will be used to match the success_format string to Unsent/Sent/Failed/Delivered.")
    )
    
    
    charge_keyword = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'Used in status updates: data matching this field indicates '
            'how many \'credits\' this message cost in the gateway'
        )
    )
    
    status_msg_id = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'The field that contains our message reference id '
            '(see uuid_keyword, above).'
        )
    )
    status_status = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'The field that contains the status code, used by status_mapping.')
    )
    status_error_code = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'The field that contains the error code. May be the same value '
            'as status_status, if no seperate error code field is used.'
        )
    )
    status_date = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'The field that contains the status update date-string. '
            'See status_date_format: that is used by this field for parsing.'
        )
    )
    status_date_format = models.CharField(max_length=128, null=True, blank=True,
        help_text=_(u'Python datetime formatting code representing the format '
            'this gateway uses for delivery time reporting. Leaving this '
            'blank means that a unix-style timestamp is used.'
        )
    )
    
    reply_content = models.CharField(max_length=128, null=True, blank=True)
    reply_sender = models.CharField(max_length=128, null=True, blank=True)
    reply_date = models.CharField(max_length=128, null=True, blank=True)
    reply_date_format = models.CharField(max_length=128, null=True, blank=True,
        default="%Y-%m-%d %H:%M:%S",
    )
        
    check_number_url = models.CharField(max_length=256, null=True, blank=True,
        help_text=_(u'The URL that can be used to check availability of sending to a number'))
    check_number_field = models.CharField(max_length=65, null=True, blank=True,
        help_text=_(u'The keyword that contains the number to check'))
    check_number_response_format = models.CharField(max_length=256, null=True, blank=True,
        help_text=_(u'A regular expression that parses the response. Keys: status, charge'))
    check_number_status_mapping = jsonfield.JSONField(null=True, blank=True)
    
    query_balance_url = models.CharField(max_length=256, null=True, blank=True,
        help_text=_(u'The url path that queries for balance'))
    query_balance_params = jsonfield.fields.JSONField(default=[])
    query_balance_response_format = models.CharField(max_length=128, null=True, blank=True)
    
    
    class Meta:
        app_label = 'sms'
    
    def __unicode__(self):
        return self.name
    
    def send(self, message):
        """
        Use this gateway to send a message.
        
        If ``djcelery`` is installed, then we assume they have set up the
        ``celeryd`` server, and we queue for delivery. Otherwise, we will
        send in-process.
        
        .. note::
            It is strongly recommended to run this out of process, 
            especially if you are sending as part of an HttpRequest, as this
            could take ~5 seconds per message that is to be sent.
        """
        if 'djcelery' in settings.INSTALLED_APPS:
            import sms.tasks
            sms.tasks.SendMessage.delay(message.pk, self.pk)
        else:
            self._send(message)
        
    def _send(self, message):
        """
        Actually do the work of sending the message. This is in a seperate
        method so we can background it it possible.
        """
        assert message.status == "Unsent", "Re-sending SMS Messages not yet supported."
        # We need to store the gateway that was used, so we can match up
        # which gateway a reply has come through.
        message.gateway = self
        # Build up a URL-encoded request.
        raw_data = {}
        if self.settings:
            raw_data.update(**self.settings)
        if message.recipient_number:
            raw_data[self.recipient_keyword] = message.recipient_number
        else:
            raise ValueError("A recipient_number must be supplied")
        # We need to see if this message needs to be sent as unicode.
        # Could be smart and try to see if it is a short enough message.
        # Or look for a preference that says if this user may send unicode
        # messages?
        raw_data[self.content_keyword] = unicodedata.normalize(
            'NFKD', 
            unicode(message.content)
        ).encode('ascii', 'ignore')
        if self.uuid_keyword:
            assert message.uuid, "Message must have a valid UUID. Has it been saved?"
            raw_data[self.uuid_keyword] = message.uuid
        data = urllib.urlencode(raw_data)
        logging.debug(data)
        logging.debug(self)
        # Now hit the server.
        res = urllib.urlopen(self.base_url, data)
        
        # Most servers will respond with something, which is only an
        # interim status, which we can get for now, and maybe update later.
        status_msg = res.read()
        logging.debug(status_msg)
        if self.error_format and re.match(self.error_format, status_msg):
            message.status = "Failed"
            message.status_message = re.match(self.error_format, status_msg).groupdict()['status_message']
            logging.warning(message.status_message)
        elif status_msg.startswith('ERR') or status_msg.startswith('WARN'):
            message.status = "Failed"
            message.status_message = status_msg.split(': ')[1]
            logging.warning(message.status_message)
        else:
            message.status = "Sent"
            parsed_response = re.match(self.success_format, status_msg).groupdict()
            if 'gateway_message_id' in parsed_response and parsed_response['gateway_message_id']:
                message.gateway_message_id = parsed_response['gateway_message_id'].strip()
            if 'status_code' in parsed_response and parsed_response['status_code']:
                message.status = self.status_mapping.get(parsed_response['status_code'])
            if 'status_message' in parsed_response and parsed_response['status_message']:
                message.status_message = parsed_response['status_message']
            logging.debug("Gateway MSG ID %s" % message.gateway_message_id)
            message.send_date = datetime.datetime.now()
        
        message.save()
        
        return message
    
    def check_availability_to_send(self, number):
        if not self.check_number_url:
            return None
            
        raw_data = {}
        raw_data.update(**self.settings)
        raw_data[self.check_number_field] = number
        data = urllib.urlencode(raw_data)
        res = urllib.urlopen(self.check_number_url, data)
        res_data = res.read()
        
        if self.check_number_response_format:
            parsed_response = re.match(self.check_number_response_format, res_data).groupdict()
            status = self.check_number_status_mapping.get(parsed_response.get('status', None), None)
            charge = self.check_number_status_mapping.get(parsed_response.get('charge', None), None)
        
            return {
                'number': number,
                'status': status,
                'charge': charge
            }
    
    def query_balance(self):
        if not self.query_balance_url:
            return None
        
        raw_data = {}
        for field in self.query_balance_params:
            raw_data[field] = self.settings[field]
        data = urllib.urlencode(raw_data)
        res = urllib.urlopen(self.query_balance_url, data)
        res_data = res.read()
        
        if self.query_balance_response_format:
            parsed_response = re.match(self.query_balance_response_format, res_data).groupdict()
            return parsed_response.get('balance', None)