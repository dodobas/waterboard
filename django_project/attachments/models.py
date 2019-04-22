from django.db import models


class Attachment(models.Model):
    attachment_uuid = models.UUIDField(primary_key=True)
    ts_created = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    feature_uuid = models.UUIDField()
    attribute_key = models.CharField(max_length=32)

    filename = models.CharField(max_length=512)
    size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=512)
    content_type_extra = models.CharField(max_length=512, null=True)
    original_filename = models.CharField(max_length=1024)
