from django.db import models
from django.core.validators import RegexValidator
import pycountry
import phonenumbers
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point


class CustomUser(AbstractUser):
    profession = models.CharField(max_length=50,null=True,blank=True)
    phone_regex = RegexValidator(
        regex=r'^\d{9,15}$',
        message="Phone number must be entered in the format: '999999999'. Up to 15 digits allowed."
    )
    countries = list(pycountry.countries)
    countries = [(str(phonenumbers.country_code_for_region(country.alpha_2)),country.name+" +"+str(phonenumbers.country_code_for_region(country.alpha_2))) for country in countries]
    phone_country_code = models.CharField(choices=countries, max_length=120)
    phone = models.CharField(validators=[phone_regex], max_length=15)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    firstname = models.CharField(max_length=50, blank=False,default="x")
    lastname = models.CharField(max_length=50, blank=False,default="x")
    location = gis_models.PointField(blank=True,null=True)
    highlighted_area = gis_models.MultiPolygonField(
        "Location in Map", geography=True, blank=True, null=True,
        srid=4326, help_text="Point(longitude latitude)")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ProfilePhoto(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    profile_photo = models.ImageField(upload_to="static/img/profile_images",null=False,blank=False,default="static/img/profil_images/blank-profile.webp")

    def __str__(self) -> str:
        return f"{self.user.username}  {self.id}"

class Address(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    street = models.CharField(max_length=255)
    number = models.CharField(max_length=10)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip = models.CharField(max_length=5)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            Address.objects.filter(user=self.user).exclude(id=self.id).update(is_primary=False)
        else:
            # Fetch the existing primary address
            existing_primary_address = Address.objects.filter(user=self.user, is_primary=False).exclude(id=self.id).first()
            if existing_primary_address:
                existing_primary_address.is_primary = True
                existing_primary_address.save()

            if Address.objects.filter(user=self.user).count() == 1:
                self.is_primary = True
        super(Address, self).save(*args, **kwargs)


    def delete(self, *args, **kwargs):
        # Check if the address being deleted is the primary address
        if self.is_primary:
            # Delete the address
            super(Address, self).delete(*args, **kwargs)

            # Check if the user has only one address left
            remaining_address_count = Address.objects.filter(user=self.user).count()
            if remaining_address_count >= 1:
                # Get the remaining address and set it as primary
                remaining_address = Address.objects.filter(user=self.user).first()
                remaining_address.is_primary = True
                remaining_address.save()
        else:
            # Delete the address without changing the primary address status
            super(Address, self).delete(*args, **kwargs)