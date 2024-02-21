import pycountry
import phonenumbers
from .models import CustomUser,Address
from rest_framework.decorators import api_view,renderer_classes,permission_classes,authentication_classes
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics,status
from .serializers import CustomUserSerializer, UserRegistrationSerializer,ProfileSerializer,AddressSerializer,ProfilePhotoSerializer,UserListSerializer,AreaSerializer
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, UpdateAPIView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model, views as auth_views
from django.contrib.gis.geos import GEOSGeometry

from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid()
        errors = serializer.errors
        print("Validation errors:", errors)
        serializer.is_valid(raise_exception=True)
        print(12)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user = CustomUser.objects.get(username=user.username)
        print(user)
        user = ProfileSerializer(user)
        return Response({'token': token.key,'data':user.data})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Invalidate the token or session
        request.auth.delete()  # Assuming you're using Token-based authentication

        # Return a success response
        return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)

class UserRegistrationView(APIView):
    def post(self, request):
        user_serializer = UserRegistrationSerializer(data=request.data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'message': 'Registration successful','token': token.key}, status=status.HTTP_201_CREATED)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def chat_profile(request,username):
    user = CustomUser.objects.get(username=username)
    context = CustomUserSerializer(user)
    return Response(context.data)


@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def country_codes(request):
    countries = list(pycountry.countries)
    countries = [(str(phonenumbers.country_code_for_region(country.alpha_2)),country.name+" +"+str(phonenumbers.country_code_for_region(country.alpha_2))) for country in countries]
    return Response(countries)


@api_view(['GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def addresses(request):
    user = request.user
    addresses = Address.objects.filter(user=user).order_by('-is_primary')
    addresses = AddressSerializer(addresses,many=True)
    return Response(addresses.data)

@api_view(['POST','GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def delete_address(request,id):
    user = request.user
    try:
        addresses = Address.objects.get(user=user,id=id).delete()
        return Response({'detail': 'Address deleted successfully.'}, status=status.HTTP_200_OK)
    except:
        return Response({'detail': 'Address has not been deleted.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def update_address(request):
    user = request.user
    data = request.data

    try:
        update_data = data.get('updateData')  # Extract the 'updateData' dictionary
        address_id = update_data.get('id')  # Extract the address ID from 'updateData'
        
        if address_id is not None:
            address = Address.objects.get(id=address_id, user=user)

            # Update the address fields based on the data from the request
            address.name = update_data.get('name', address.name)
            address.street = update_data.get('street', address.street)
            address.number = update_data.get('number', address.number)
            address.city = update_data.get('city', address.city)
            address.state = update_data.get('state', address.state)
            address.zip_code = update_data.get('zip', address.zip)
            address.is_primary = update_data.get('is_primary', address.is_primary)

            # Save the updated address
            address.save()

            return Response({'detail': 'Address updated successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Address ID is missing in the request data.'}, status=status.HTTP_400_BAD_REQUEST)
    except Address.DoesNotExist:
        return Response({'detail': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def make_primary_address(request):
    user = request.user
    address_id = request.data.get('aId')
    try:
        address = Address.objects.get(id=address_id, user=user)

        # Set the 'is_primary' field of the address to True
        address.is_primary = True
        address.save()

        # Update other addresses for the same user to set 'is_primary' to False
        Address.objects.filter(user=user).exclude(id=address_id).update(is_primary=False)

        return Response({'detail': 'Address set as primary successfully.'}, status=status.HTTP_200_OK)
    except Address.DoesNotExist:
        return Response({'detail': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_address(request):
    if request.method == 'POST':
        # Check if the user already has three addresses
        if Address.objects.filter(user=request.user).count() >= 3:
            return Response({'detail': 'You cannot add more than three addresses.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the data from the request
        data = request.data.get('newAddressData')
        # Assuming you have an Address serializer defined, you can use it to validate and create a new address
        serializer = AddressSerializer(data=data)
        if serializer.is_valid():
            # Create a new address instance
            address = Address.objects.create(
                user=request.user,
                name=data['name'],
                street=data['street'],
                number=data['number'],
                city=data['city'],
                state=data['state'],
                zip=data['zip'],
                is_primary=False  # You may set this to True if needed
            )

            # You can also set the user for the address based on the authenticated user
            address.user = request.user  # Assuming you have a user field in your Address model

            # Save the new address
            address.save()

            return Response({'detail': 'Address created successfully.'}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST','GET'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@permission_classes([IsAuthenticated])
def edit_profile(request):
    try:
        user = request.user
        data = request.data
        
        # Update user fields based on the data received
        if 'first_name' in data and data['first_name']:
            user.firstname = data['first_name']
        if 'last_name' in data and data['last_name']:
            user.lastname = data['last_name']
        if 'email' in data and data['email']:
            user.email = data['email']
        if 'profession' in data and data['profession']:
            user.profession = data['profession']
        if 'phone_country_code' in data and data['phone_country_code']:
            user.phone_country_code = data['phone_country_code']
        if 'phone' in data and data['phone']:
            user.phone = data['phone']

        # Save the updated user data
        user.save()
        user = ProfileSerializer(user)

        return Response({'message': 'User data updated successfully','userData':user.data})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

User = get_user_model()

class PasswordResetView(CreateAPIView):
    def create(self, *args, **kwargs):
        request = self.request
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()

        if user:
            # Generate a password reset token and email
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Build the password reset URL
            reset_url = f"http://192.168.178.137:5173/reset-password/{uid}/{token}/"

            # Send the email with the reset URL
            # You can use Django's send_mail or any other email library here
            # Example using Django's send_mail:
            from django.core.mail import send_mail

            send_mail(
                subject = 'Reset Your Password',
                message = f'click the url to reset the password {reset_url}',
                from_email = 'verification@viptaskers.com',
                recipient_list = [email,],
            )

            return Response({'detail': 'Password reset email sent successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'User not found with this email.'}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(UpdateAPIView):
    def post(self, *args, **kwargs):
        request = self.request
        uidb64 = kwargs.get('uidb64')
        token = kwargs.get('token')
        new_password = request.data.get('new-password')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password reset successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid token or user.'}, status=status.HTTP_400_BAD_REQUEST)


import base64
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import ProfilePhoto
from .serializers import ProfilePhotoSerializer
import time

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_profile_photo(request):
    # Get the base64-encoded image from the request
    base64_image = request.data.get('profilePhoto')
    base64_image = str(base64_image).split(';base64,')[-1]
    
    # Decode the base64 image
    image_data = base64.b64decode(base64_image)

    # Generate a unique file name for the image, e.g., using a timestamp
    file_path = 'static/img/profile_images/profile_{timestamp}.png'.format(
            timestamp=int(time.time())
        )

    # Save the image in the media directory using default_storage
    image_file = ContentFile(image_data)
    path = default_storage.save(file_path, ContentFile(image_data))

    # Get the currently logged-in user
    user = request.user

    # Create a new ProfilePhoto object associated with the user
    new_profile_photo = ProfilePhoto(user=user, profile_photo=path)
    new_profile_photo.save()

    # Serialize the ProfilePhoto object to return its URL in the response
    serializer = ProfilePhotoSerializer(new_profile_photo)

    return Response(serializer.data, status=status.HTTP_201_CREATED)
    # except Exception as e:
    #     return Response({'error': 'Error saving the image.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_users(request):
    users = CustomUser.objects.all().order_by('username')
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)

from django.http import JsonResponse
from django.contrib.gis.geos import Point, MultiPolygon, Polygon
import json 

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def save_highlighted_area(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        # Extract data from the request
        city_name = data.get('cityName')
        highlighted_shapes = data.get('highlightedShape')
        highlighted_city = data.get('highlightedCity')
        is_city_inside_polygon = data.get('isCityInsidePolygon')
        print(highlighted_shapes)
        # Save to CustomUser
        if city_name and highlighted_shapes:
            # Assuming you have a way to identify the user, such as username or ID
            user = CustomUser.objects.get(username="Me")  # Update this line accordingly

            multipolygons = []
            print(highlighted_shapes)
            for highlighted_shape in highlighted_shapes:
                # Ensure that the first and last points are the same to form a closed loop
                if highlighted_shape[0] != highlighted_shape[-1]:
                    highlighted_shape.append(highlighted_shape[0])

                # Convert the list of coordinates to a Polygon
                polygons = []
                for coord in highlighted_shape:
                    print(coord)
                    coord_tuple = (coord['lng'], coord['lat'])  # Assuming 'lng' is the longitude key and 'lat' is the latitude key
                    polygons.append(coord_tuple)

                # Ensure that there are at least 4 distinct coordinates
                if len(set(polygons)) >= 4:
                    # Create and save Polygon
                    polygon = Polygon(polygons)
                    multipolygons.append(polygon)
                else:
                    return JsonResponse({'error': 'At least 4 distinct points are required for each polygon.'}, status=400)

            # Create and save MultiPolygon
            multipolygon = MultiPolygon(*multipolygons)

            # Update CustomUser with highlighted_area
            user.highlighted_area = multipolygon
            user.save()

            return JsonResponse({'message': 'Highlighted areas saved successfully.'})
        else:
            return JsonResponse({'error': 'Invalid data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_area(request):
    user = request.user
    user_serializer = AreaSerializer(user)
    return Response(user_serializer.data)

