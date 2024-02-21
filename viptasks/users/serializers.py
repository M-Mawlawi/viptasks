from rest_framework import serializers
from .models import CustomUser,Address,ProfilePhoto
from django.contrib.gis.geos import GEOSGeometry, WKTWriter


class ProfilePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePhoto
        fields = ['profile_photo']

class ProfileSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['username', 'firstname', 'lastname', 'email', 'profession', 'phone_country_code', 'phone', 'profile_photo']

    def get_profile_photo(self, obj):
        try:
            latest_profile_photo = ProfilePhoto.objects.filter(user=obj).latest('id')
            serializer = ProfilePhotoSerializer(latest_profile_photo)
            return serializer.data['profile_photo']
        except ProfilePhoto.DoesNotExist:
            return None

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__' 

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ['user']

class CustomUserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = ['profession','phone_country_code','profile_photo','phone']

    def get_profile_photo(self, obj):
        try:
            latest_profile_photo = ProfilePhoto.objects.filter(user=obj).latest('id')
            serializer = ProfilePhotoSerializer(latest_profile_photo)
            return serializer.data['profile_photo']
        except ProfilePhoto.DoesNotExist:
            return None

class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    is_staff = serializers.BooleanField(required=True)
    class Meta:
        model = CustomUser
        fields = ['username', 'firstname', 'lastname', 'email' , 'password' , 'password_confirmation','is_staff','profession']  # Add other fields as needed
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        # Check if the passwords match
        if data.get('password') != data.get('password_confirmation'):
            raise serializers.ValidationError("Passwords do not match.")
        
        data.pop('password_confirmation', None)
        return data
    
    def to_internal_value(self, data):
        # Map 'userType' to 'is_staff'
        user_type = data.pop('userType', None)
        if user_type == 'tasker':
            data['is_staff'] = True
        elif user_type == 'customer':
            data['is_staff'] = False
        else:
            raise serializers.ValidationError("Invalid userType. It should be 'tasker' or 'customer'.")
        
        return super().to_internal_value(data)

class AreaSerializer(serializers.ModelSerializer):
    highlighted_area = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['highlighted_area', 'location']

    def get_highlighted_area(self, instance):
        return self.serialize_geos_geometry(instance.highlighted_area)

    def get_location(self, instance):
        return self.serialize_geos_geometry(instance.location)

    def serialize_geos_geometry(self, geometry):
        if geometry:
            wkt_writer = WKTWriter()
            return wkt_writer.write(geometry)
        return None

# class PasswordResetSerializer(serializers.Serializer):
#     email = serializers.EmailField()

# class PasswordResetConfirmSerializer(serializers.Serializer):
#     new_password = serializers.CharField(write_only=True)