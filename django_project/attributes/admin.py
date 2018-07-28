from urllib.parse import parse_qsl

from django import forms
from django.contrib import admin

from .constants import CHOICE_ATTRIBUTE_OPTIONS, SIMPLE_ATTRIBUTE_OPTIONS
from .models import Attribute, AttributeGroup, AttributeOption, ChoiceAttribute, SimpleAttribute


class AttributeGroupAdmin(admin.ModelAdmin):
    list_display = ('label', 'position')
    fields = ('label', 'position')
    ordering = ('position',)


class AddFormMixin:
    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            if self.add_form:
                defaults['form'] = self.add_form
            else:
                raise ValueError('Missing `add_form` class attribute')
        defaults.update(kwargs)
        return super().get_form(request, obj, **defaults)


class AttributeMixin:
    list_display = ('label', 'attribute_group', 'result_type', 'required', 'searchable', 'orderable', 'position')
    fields = ('attribute_group', 'label', 'result_type', 'position', 'required', 'searchable', 'orderable')
    list_filter = ('attribute_group', 'required', 'searchable', 'orderable')
    ordering = ('attribute_group', 'position', 'id')


class AttributeAddForm(forms.ModelForm):

    class Meta:
        model = Attribute
        fields = ()

    def __init__(self, *args, **kwargs):

        initial = kwargs.get('initial', {})

        if '_changelist_filters' in initial:
            changelist_filters = parse_qsl(initial.get('_changelist_filters'))
            attribute_group_id = [
                attr_id for key, attr_id in changelist_filters if key == 'attribute_group__id__exact'
            ][0]
            if attribute_group_id:
                attributegroup_obj = AttributeGroup.objects.get(id=attribute_group_id)
                kwargs['initial'].update({'attribute_group': attributegroup_obj})

        super().__init__(*args, **kwargs)


class SimpleAttributeAdmin(AddFormMixin, AttributeMixin, admin.ModelAdmin):
    add_form = AttributeAddForm

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'result_type':
            kwargs['choices'] = SIMPLE_ATTRIBUTE_OPTIONS
        return super().formfield_for_choice_field(db_field, request, **kwargs)


class ChoiceAttributeAdmin(AddFormMixin, AttributeMixin, admin.ModelAdmin):
    add_form = AttributeAddForm

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'result_type':
            kwargs['choices'] = CHOICE_ATTRIBUTE_OPTIONS
        return super().formfield_for_choice_field(db_field, request, **kwargs)


class AttributeOptionAddForm(forms.ModelForm):

    class Meta:
        model = AttributeOption
        fields = ()

    def __init__(self, *args, **kwargs):

        initial = kwargs.get('initial', {})

        if '_changelist_filters' in initial:
            changelist_filters = parse_qsl(initial.get('_changelist_filters'))
            attribute_id = [attr_id for key, attr_id in changelist_filters if key == 'attribute__id__exact'][0]
            if attribute_id:
                attribute_obj = Attribute.objects.get(id=attribute_id)
                kwargs['initial'].update({'attribute': attribute_obj})

        super().__init__(*args, **kwargs)


class AttributeOptionAdmin(AddFormMixin, admin.ModelAdmin):
    fields = ('attribute', 'option', 'value', 'description', 'position')
    list_filter = ('attribute', )
    list_display = ('attribute', 'option', 'value', 'description', 'position')
    ordering = ('attribute', 'position')
    list_select_related = ('attribute', )

    add_form = AttributeOptionAddForm


admin.site.register(AttributeGroup, AttributeGroupAdmin)
admin.site.register(SimpleAttribute, SimpleAttributeAdmin)
admin.site.register(ChoiceAttribute, ChoiceAttributeAdmin)
admin.site.register(AttributeOption, AttributeOptionAdmin)
