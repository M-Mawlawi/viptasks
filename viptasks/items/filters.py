from django import template
from django.utils.translation import gettext as _
from models import Categorie

register = template.Library()

@register.filter
def translate_category_name(category_pk):
    # Fetch the translated category name based on the primary key
    try:
        category = Categorie.objects.get(pk=category_pk)
        return _(category.name)
    except Categorie.DoesNotExist:
        return ""