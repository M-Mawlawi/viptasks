from django import forms
from .models import Order, OrderItem, Specification, Item
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['customer', 'address', 'appointment']


class OrderItemForm(forms.ModelForm):
    item = forms.ModelChoiceField(queryset=Item.objects.all(), empty_label="Select an Item")
    specification = forms.ModelChoiceField(queryset=Specification.objects.none(), required=False, empty_label="Select a Specification (if applicable)")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'POST'
        self.helper.add_input(Submit('submit', 'Submit', css_class='btn-primary'))
        self.helper.form_id = 'order-form'
        self.helper.form_action = 'create_order'

        # Update queryset for the specification field based on the selected item
        if 'item' in self.data:
            try:
                item_id = int(self.data.get('item'))
                self.fields['specification'].queryset = Specification.objects.filter(item_id=item_id)
            except (ValueError, TypeError):
                pass

    class Meta:
        model = OrderItem
        fields = ['item', 'specification']

       

    def clean(self):
        cleaned_data = super().clean()
        item = cleaned_data.get("item")

        if item:
            self.fields["specification"].queryset = item.specifications.all()

        return cleaned_data

    

        