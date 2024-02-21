from rest_framework import serializers
from .models import Item, Specification, Order, OrderItem,Room


class ItemSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(source='category.id')
    category_name = serializers.CharField(source='category.name')

    class Meta:
        model = Item
        fields = ['id', 'name', 'category_id', 'category_name', 'price','item_photo']


class SpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specification
        fields = ['id', 'specification', 'price']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'address', 'appointment', 'status']
    
    def create(self, validated_data):
        # Set the customer field to the authenticated user
        validated_data['customer'] = self.context['request'].user
        
        order = Order.objects.create(**validated_data)
        return order



class OrderItemSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(source='item.id')
    specification_id = serializers.IntegerField(source='specification.id')
    
    class Meta:
        model = OrderItem
        fields = ['item_id', 'specification_id']
    
    def create(self, validated_data):
        item_id = validated_data.pop('item')['id']
        specification_id = validated_data.pop('specification')['id']
        
        # Get the user making the request
        user = self.context['request'].user
        
        # Look for an existing order with 'not submitted' status for the user
        order = Order.objects.filter(customer=user, status='not submitted').first()
        
        if not order:
            # If no order found, create a new order for the user
            order = Order.objects.create(customer=user, status='not submitted')
            
        # Get the item and specification objects
        item = Item.objects.get(pk=item_id)
        specification = Specification.objects.get(pk=specification_id)
        
        # Create order item for the order
        order_item = OrderItem.objects.create(order=order, item=item, specification=specification)
        
        return order_item

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['room',]