import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

LOG = logging.getLogger(__name__)


class EmailLoginModelBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):
        WebUser = get_user_model()

        if username is None:
            username = kwargs.get(WebUser.USERNAME_FIELD)

        try:
            user = WebUser._default_manager.filter(email__istartswith=f'{username.split("@")[0]}@').get()
        except WebUser.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            WebUser().set_password(password)
        else:
            LOG.error(f'User {username}, tried to login with email')

            if user.check_password(password) and self.user_can_authenticate(user):
                LOG.error(f'User {username}, auth with login')
                return user


class CaseInsensitiveLoginModelBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):
        WebUser = get_user_model()

        if username is None:
            username = kwargs.get(WebUser.USERNAME_FIELD)
        try:
            user = WebUser._default_manager.get(username__iexact=username)
        except WebUser.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            WebUser().set_password(password)
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                LOG.warning(f'User {username}, auth case-insensitive')
                return user
