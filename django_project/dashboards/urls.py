from django.urls import path

from .views import DashboardsList, DashboardsMapData, DashboardsTableReport, DashboardView

urlpatterns = (
    path('', DashboardView.as_view(), name='index'),
    path('data/', DashboardsList.as_view(), name='dashboard.list'),
    path('dashboard-tabledata/', DashboardsTableReport.as_view(), name='dashboard.tablelist'),
    path('dashboard-mapdata/', DashboardsMapData.as_view(), name='dashboard.mapcluster')
)
