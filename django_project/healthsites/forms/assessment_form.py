__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'


from django import forms


class GroupForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(GroupForm, self).__init__(*args, **kwargs)
        self.fields['test'] = forms.CharField()


class Group(object):
    def __init__(self, name, group=None, form=None):
        self.name = name
        self.form = group



class AssessmentForm(forms.Form):
    name = forms.CharField()

    def groups(self):
        group1 = Group('name 1', self)
        group2 = Group('gruop 2', GroupForm())
        return [group1, group2]


