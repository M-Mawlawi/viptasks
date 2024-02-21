from django.db import models
from django.conf import settings
from decimal import Decimal
from chat.models import Thread

class Room(models.Model):
    room = models.CharField(max_length=50,unique=True)
    def __str__(self):
        return self.room

class Categorie(models.Model):
    name = models.CharField(max_length=50)
    room = models.ForeignKey(Room,on_delete=models.CASCADE,null=True)
    def __str__(self):
        return f"{self.name} category"


class Item(models.Model):
    name = models.CharField(max_length=50)
    category = models.ForeignKey(Categorie, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    item_photo = models.ImageField(null=True,upload_to='static/items/photos/')

    def __str__(self):
        return f"{self.name} ({self.category.name} category)"


class Specification(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE,related_name='specifications')  
    specification = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.specification} -> {self.item.name}"

class Order(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    address = models.CharField(max_length=255, null=True, blank=True)
    appointment = models.DateTimeField(null=True, blank=True)
    employer_percentage = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders')
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('accepted', 'Accepted'),
        ('payment_approved', 'Payment Approved'),
        ('canceled', 'Canceled'),
        ('not_submitted', 'NotSubmitted'),
    ]

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='not_submitted')

    class Meta:
        verbose_name_plural = 'Orders'
        permissions = [
            ('change_status', 'Can change status'),
        ]

    @property
    def total_price(self):
        order_items = OrderItem.objects.filter(order=self)
        if order_items:
            if order_items[0].price != None or order_items[0].price != None:
                total_price = sum(item.price for item in order_items)
                self.employer_percentage = total_price * Decimal('0.7')
                self.save()
                return total_price

    def save(self, *args, **kwargs):
        # Check if the order is being created (i.e., not being updated)
        if self.pk is None:
            # Look for an existing 'not_submitted' order
            existing_order = Order.objects.filter(customer=self.customer, status='not_submitted').first()

            # If an existing 'not_submitted' order is found, use it instead of creating a new one
            if existing_order:
                self.pk = existing_order.pk
        
        if self.assigned_to:
            Thread.objects.get_or_create_personal_thread(self.customer,self.assigned_to)
        # Save the order (either a new one or an updated one)
        super().save(*args, **kwargs)



    def update_total_price(self):
        self.total_price = self.calculate_total_price()
        self.save()
    
    def calculate_total_price(self):
        order_items = OrderItem.objects.filter(order=self)
        total_price = sum(item.price for item in order_items)
        return total_price

    def __str__(self):
        return f"{self.customer.first_name} {self.customer.last_name} - Order #{self.id}"




class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE,related_name='order_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    specification = models.ForeignKey(Specification, on_delete=models.SET_NULL, null=True, blank=True)

    def calculate_price(self):
        price = None 
        if self.specification == None:
            price = self.item.price
        else:
            price = self.specification.price
        return price

    def save(self, *args, **kwargs):
        self.price = self.calculate_price()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item.name} ({self.order.customer.first_name} {self.order.customer.last_name}) - {self.price}$"
