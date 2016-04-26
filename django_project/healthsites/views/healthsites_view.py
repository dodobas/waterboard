__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

from django.http import Http404, HttpResponse
from django.views.generic.edit import FormView

from healthsites.forms.assessment_form import AssessmentForm
from healthsites.utils import healthsites_clustering


class HealthsitesView(FormView):
    template_name = 'healthsites.html'
    form_class = AssessmentForm
    success_url = '/healthsites'


def get_cluster(request):
    if request.method == "GET":
        if not (all(param in request.GET for param in ['bbox', 'zoom', 'iconsize'])):
            raise Http404
        result = healthsites_clustering(request.GET['bbox'], int(request.GET['zoom']),
                                        map(int, request.GET.get('iconsize').split(',')))
        return HttpResponse(result, content_type='application/json')
