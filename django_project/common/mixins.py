from django.contrib.auth.mixins import LoginRequiredMixin


class AdminRequiredMixin(LoginRequiredMixin):
    def dispatch(self, *args, **kwargs):
        if self.request.user.is_staff:
            return super().dispatch(*args, **kwargs)
        else:
            return self.handle_no_permission()
