from django.contrib import admin
from .models import CustomUser,Address,ProfilePhoto
from leaflet.admin import LeafletGeoAdmin


class AddressInline(admin.TabularInline):
    model = Address
    extra = 1  # Number of empty address forms to display

class ProfilePhotoInline(admin.TabularInline):
    model = ProfilePhoto
    extra = 1

class CustomUserAdmin(LeafletGeoAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'firstname', 'lastname', 'is_staff', 'phone_country_code', 'phone','location')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('firstname', 'lastname', 'email', 'profession', 'phone_country_code', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
        ('Service Location',{'fields': ('location','highlighted_area')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff'),
        }),
    )
    inlines = [AddressInline, ProfilePhotoInline]



admin.site.register(CustomUser, CustomUserAdmin)
