# coding=utf-8
"""Select users to be notified."""

__author__ = 'Christian Christelis <christian@kartoza.com>'
__project_name = 'watchkeeper'
__date__ = '27/05/15'
__copyright__ = 'kartoza.com'
__doc__ = ''


from celery import shared_task

from notifications.tasks.send_email import send_email_message
from notifications.tasks.send_sms import send_sms_message

from event_mapper.models.user import User
from event_mapper.models.event import Event


def generate_email_report(event):
    """Generate report for email as html
    :param event: Event object
    :return: A html string represent the report.
    """
    html_report = """
        <html>
        <head>
        <meta name=3D"generator" content=3D"Windows Mail 17.5.9600.20911">
        <style data-externalstyle=3D"true"><!--
        p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {
        margin-top:0in;
        margin-right:0in;
        margin-bottom:0in;
        margin-left:.5in;
        margin-bottom:.0001pt;
        }
        p.MsoNormal, li.MsoNormal, div.MsoNormal {
        margin:0in;
        margin-bottom:.0001pt;
        }
        p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst,=20
        p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle,=20
        p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {
        margin-top:0in;
        margin-right:0in;
        margin-bottom:0in;
        margin-left:.5in;
        margin-bottom:.0001pt;
        line-height:115%;
        }
        --></style></head>
        <body dir=3D"ltr">
        <div><h2>"
        </h2> <img tabindex=3D"-1" src=3D"http://watchkeeper.kartoza.com/static/event_mapper/css/images/logo.fa285e1ad75d.png">
        """
    html_report += """
            <table width=3D"699" tabindex=3D"-1" style=3D"border-collapse: collapse;" cellspacing=3D"0" cellpadding=3D"0">
            <tbody>"""
    html_report += event.html_table_row()
    html_report += """</tbody>
            </table><h2 style=3D"color: rgb(149, 55, 53); font-family: trebuchet MS; font-size: 12pt; font-weight: bold; margin-bottom: 0px;">"""
    html_report += """
            </div>
            </body>
            </html>
            <br>
            This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error please notify the system manager. Any views or opinions presented in this email are solely those of the author and do not necessarily represent those of iMMAP. The recipient should check this email and any attachments for the presence of viruses. iMMAP accepts no liability for any damage caused by any virus transmitted by this email.</font><br><div style=3D"font-family:Arial,Helvetica,sans-serif;font-size:1.3em"><div><font size=3D"1" style=3D"background-color:white"><br></font><div><font size=3D"1" style=3D"background-color:white"><font face=3D"Arial, Helvetica, sans-serif">iMMAP, 1300 Pennsylvania Avenue, N.W.,=C2=A0</font>Suite 470=C2=A0Washington DC 20004, <a href=3D"http://www.immap.org" target=3D"_blank">www.immap.org</a></font></div></div></div>
            """
    return html_report


@shared_task
def notify_priority_users(event_id):
    event = Event.objects.get(id=event_id)
    users = User.objects.filter(
        countries_notified__polygon_geometry__contains=event.location,
        notify_immediately=True)

    for user in users:
        send_email_message(user, event.text_report(), event.html_report())
