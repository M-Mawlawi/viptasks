from modeltranslation.translator import translator, TranslationOptions
from items.models import Item,Categorie,Room,Specification

class ItemTranslationOptions(TranslationOptions):
    fields = ('name',)

class CategoryTranslationOptions(TranslationOptions):
    fields=('name',)

class RoomTranslationOptions(TranslationOptions):
    fields = ('room',)

class SpecificationTranslationOptions(TranslationOptions):
    fields = ('specification',)


translator.register(Item,ItemTranslationOptions)
translator.register(Categorie,CategoryTranslationOptions)
translator.register(Room,RoomTranslationOptions)
translator.register(Specification,SpecificationTranslationOptions)