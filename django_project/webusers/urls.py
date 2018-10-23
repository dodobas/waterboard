from django.urls import path

from .views import change_password, login, logout, profile

app_name = 'webusers'

urlpatterns = (
    # User related urls
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('change_password/', change_password, name='change_password')
)
