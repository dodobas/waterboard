from django.urls import path

from .views import ImportData, ImportDataTask, ImportHistory, TaskHistoryView

app_name = 'imports'

urlpatterns = (
    path('import_data/<int:task_id>/', ImportDataTask.as_view(), name='insert_data_task'),
    path('import_data/', ImportData.as_view(), name='import_data'),
    path('import_history/<int:task_id>/', TaskHistoryView.as_view(), name='file_history'),
    path('import_history/', ImportHistory.as_view(), name='import_history')
)
