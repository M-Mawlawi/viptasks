# Generated by Django 5.0 on 2023-12-14 23:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_polygonmodel_customuser_location_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='polygon',
            new_name='highlighted_area',
        ),
    ]
