from rest_framework import serializers
from .models import Message, TextMessage,Image

class TextMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextMessage
        fields = ('text',)

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('image',)

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    content_object = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'sender_username', 'content_object', 'readed','created_at')

    def get_sender_username(self, obj):
        return obj.sender.username

    def get_content_object(self, obj):
        if obj.content_type.model == 'textmessage':
            return TextMessageSerializer(obj.content_object).data
        elif obj.content_type.model == 'image':
            return ImageSerializer(obj.content_object).data
        return None
