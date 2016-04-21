__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'


from django import forms

class AssessmentForm(forms.Form):
    name = forms.CharField()
