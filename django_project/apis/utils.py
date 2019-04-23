from django import forms
from django.core.exceptions import ValidationError


EMPTY_VALUES = (None, '', [], (), {})


def validate_payload(attr_spec, payload):

    errors = dict()
    errors['total_errors'] = 0

    for attr in attr_spec:
        key = attr['key']

        value = payload.get(key, None)

        if attr['result_type'] == 'Integer':
            field = forms.IntegerField(
                required=attr['required'], min_value=attr['min_value'], max_value=attr['max_value']
            )

        elif attr['result_type'] == 'Decimal':
            field = forms.DecimalField(
                decimal_places=8, required=attr['required'], min_value=attr['min_value'], max_value=attr['max_value']
            )

        elif attr['result_type'] == 'Text':
            field = forms.CharField(max_length=attr['max_length'], required=attr['required'])

        elif attr['result_type'] == 'DropDown':
            field = forms.CharField(max_length=attr['max_length'], required=attr['required'])

        elif attr['result_type'] == 'Attachment':
            # no validation for Attachments
            # TODO: this is a systemfield, and not a user field
            continue
        else:
            raise ValueError(f'Unknown result_type: {attr["result_type"]}')

        try:
            transformed_value = field.to_python(value)
            validated_value = field.clean(transformed_value)
        except ValidationError as err:
            errors[key] = [str(e.message) for e in err.error_list]
            errors['total_errors'] += len(errors[key])

    return errors
