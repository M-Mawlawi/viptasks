from django.contrib import admin
from .models import Message,Image,TextMessage,Thread

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id','sender','readed']

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ['id','image']

@admin.register(TextMessage)
class TextMessageAdmin(admin.ModelAdmin):
    list_display = ['id','text']

@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ['id','name']