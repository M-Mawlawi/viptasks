from django.urls import path
from . import views

urlpatterns = [
    path('api/api-token-auth/', views.CustomAuthToken.as_view()),
    path('api/logout/',views.LogoutView.as_view(),name="logout"),
    path('api/register/', views.UserRegistrationView.as_view(), name='user-registration'),
    path('api/chat/profile/<str:username>/', views.chat_profile, name='chat-profile'),
    path('api/password-reset/', views.PasswordResetView.as_view(), name='password-reset'),
    path('api/password-reset-confirm/<str:uidb64>/<str:token>/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/country-codes/',views.country_codes,name="country-codes"),
    path('api/get-addresses/',views.addresses,name="get-addresses"),
    path('api/update-address/',views.update_address,name="update-address"),
    path('api/primary-address/',views.make_primary_address,name="primary-address"),
    path('api/create-address/',views.create_address,name="create-address"),
    path('api/delete-addresses/<int:id>/',views.delete_address,name="delete-addresses"),
    path('api/profile/edit/',views.edit_profile,name="edit-profile"),
    path('api/update-profile-photo/', views.update_profile_photo, name='update_profile_photo'),
    path('users/',views.get_users),
    path('api/save-area/',views.save_highlighted_area,name="save-area"),
    path('api/get-area/',views.get_area,name="get-area")
]