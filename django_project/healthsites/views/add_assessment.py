__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

from django.views.generic.edit import FormView

from healthsites.forms.assessment_form import AssessmentForm

class AddAssessment(FormView):
    template_name = 'healthsites.html'
    form_class = AssessmentForm
    success_url = '/healthsites/'
