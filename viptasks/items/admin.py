from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.urls import path
from .models import Categorie, Item, Order, OrderItem,Specification,Room

CustomUser = get_user_model()

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display=('room',)

class ItemInline(admin.TabularInline):
    model = Item

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('price',)

@admin.register(Categorie)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id','name',)


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category','price')

@admin.register(Specification)
class SpecificationsAdmin(admin.ModelAdmin):
    list_display = ('item','specification', 'price')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ['customer', 'address', 'appointment', 'assigned_to', 'payment','total_price','status']
    list_editable = ['status']
    date_hierarchy = 'appointment'

    def get_readonly_fields(self, request, obj=None):
        # Get the default read-only fields
        readonly_fields = super().get_readonly_fields(request, obj)

        # If the user is not a staff member, make all fields read-only except the one field
        if not request.user.is_staff:
            readonly_fields = [f.name for f in self.model._meta.fields if f.name != 'status']

        return readonly_fields

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        elif request.user.is_staff:
            return qs.filter(assigned_to=request.user)
        else:
            return qs.none()


    def payment(self, obj):
        return obj.employer_percentage

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "customer":
            kwargs["initial"] = request.user.id
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_inline_instances(self, request, obj=None):
        if obj is None:
            return []
        return super().get_inline_instances(request, obj)




@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'item', 'price')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        elif request.user.is_staff:
            return qs.filter(order__assigned_to=request.user)
        else:
            return qs.none()

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_staff:
            return ['price']
        else:
            return []

# @admin.register(CustomUser)
# class CustomUserAdmin(UserAdmin):
#     list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'address', 'phone')
#     fieldsets = (
#         (None, {'fields': ('username', 'password')}),
#         ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'address', 'phone')}),
#         ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
#         ('Important dates', {'fields': ('last_login', 'date_joined')}),
#     )

admin.site.site_header = 'VIP Tasks'
admin.site.index_title = 'VIP Tasks'
