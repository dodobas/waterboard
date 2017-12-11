from celery.task import Task

import logging

from sms.models import Message, Gateway

class SendMessage(Task):
    max_retries = 10
    default_retry_delay = 3
    
    def run(self, message_id, gateway_id=None, **kwargs):
        logging.debug("About to send a message.")
        
        # Because we don't always have control over transactions
        # in our calling code, we will retry up to 10 times, every 3
        # seconds, in order to try to allow for the commit to the database
        # to finish. That gives the server 30 seconds to write all of
        # the data to the database, and finish the view.
        try:
            message = Message.objects.get(pk=message_id)
        except Exception as exc:
            raise SendMessage.retry(exc=exc)
        
        if not gateway_id:
            if hasattr(message.billee, 'sms_gateway'):
                gateway = message.billee.sms_gateway
            else:
                gateway = Gateway.objects.all()[0]
        else:
            gateway = Gateway.objects.get(pk=gateway_id)
            
        response = gateway._send(message)
        
        logging.debug("Done sending message.")
