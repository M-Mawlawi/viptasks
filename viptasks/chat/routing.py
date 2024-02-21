from django.urls import re_path,path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat_panel/chat/(?P<username>\w+)/$', consumers.ChatConsumer.as_asgi()),
    # re_path(r'ws/panel/chat/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/chat_panel/$', consumers.PanelConsumer.as_asgi()),
]