from django.shortcuts import render, redirect
from .forms import OrderItemForm
from .models import Order, OrderItem, Item,Specification,Room
from django.http import JsonResponse
import sys
from rest_framework.decorators import api_view,renderer_classes
from rest_framework.response import Response
from .serializers import ItemSerializer,SpecificationSerializer,OrderSerializer,OrderItemSerializer,RoomSerializer
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework import status
from django.utils.translation import gettext as _
from django.db.models import Q
from django.http import Http404


@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
def item_list(request):
    items = Item.objects.all()
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
def get_item_specifications(request, item_id):
    item = Item.objects.get(pk=item_id)
    specifications = Specification.objects.filter(item=item)
    print(specifications)
    serializer = SpecificationSerializer(specifications,many=True)
    return Response(serializer.data)

@api_view(['POST','GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
def create_order(request):
    serializer = OrderItemSerializer(data=request.data,context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.utils.translation import activate


@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
def products(request, room):
    room = str(room).replace("-"," ")
    products = Item.objects.filter(
        Q(category__room__room__iexact=room) | Q(category__room__room__iexact=room.capitalize())
    ).select_related('category')
    if products:
        # Serialize the filtered products
        products = ItemSerializer(products, many=True)
    else:
        raise Http404("No products found for the specified room.")

    return Response(products.data)

@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
def rooms(request):
    rooms = Room.objects.all()
    rooms = RoomSerializer(rooms,many=True)
    return Response(rooms.data)


def react(request,any_path):
    return render(request,"react/dist/index.html")