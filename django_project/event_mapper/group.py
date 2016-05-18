__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '18/05/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'


def has_group_approval(user):
    if user:
        return user.groups.filter(name='datacaptor').count() == 0
    return False
