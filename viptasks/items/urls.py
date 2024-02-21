from . import views
from django.urls import path, include

urlpatterns = [
    path('api/create_order/', views.create_order, name='create_order'),
    path('api/items/<int:item_id>/specifications/', views.get_item_specifications, name='get_item_specifications'),
    path('api/items/', views.item_list,name="items"),
    path('api/products/<str:room>/',views.products,name="products"),
    path('api/rooms/',views.rooms,name="rooms"),
    # path('<path:any_path>',views.react,name="app")
]
