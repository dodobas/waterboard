# -*- coding: utf-8 -*-
__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '13/06/16'


from openpyxl import load_workbook

from django.http import HttpResponse

from healthsites.models.assessment import HealthsiteAssessment


def download_assesment_report(request, assessment_id):
    """The view to download users data as CSV.

    :param request: A django request object.
    :type request: request

    :return: A CSV File
    :type: HttpResponse
    """
    assessment = HealthsiteAssessment.objects.get(id=assessment_id)
    context = assessment.get_context_data()

    workbook = load_workbook('healthsites/templates/report.xlsx')
    sheet = workbook.get_sheet_by_name('0_SurveyList')
    for row in range(4, 65, 1):
        key = sheet.cell("J%s" % row).value
        if key in context:
            sheet.cell("J%s" % row).value = context[key]

    download_file_name = 'report_%s.xlsx' % assessment_id
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response['Content-Disposition'] = 'attachment; filename=%s' % download_file_name

    workbook.save(response)

    return response
