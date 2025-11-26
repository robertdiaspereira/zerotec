from rest_framework import serializers
from .models import Webhook

class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = ['id', 'event', 'url', 'active', 'created_at']
