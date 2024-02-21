from django.urls import path

from . import views

urlpatterns = [
    path('api/get_username/', views.get_username, name='index'),
    path('api/chat/messages/<str:username>/', views.get_chat_messages, name="get_messages"),
    # path('chat/send-photos/',views.upload_photos,name="upload-photos"),
    path('api/get_chats/',views.get_chats, name='panel'),
    path('api/messages/read/',views.set_readed,name="set_readed"),
    path("", views.index, name="index"),
]