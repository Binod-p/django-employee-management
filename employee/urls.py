from django.urls import path

from employee.views import home_view, EmployeeListView, EmployeeHandler, DepartmentHandler, DepartmentListView, \
    employee_bulk_import_view

api_urls = [
    path('api/employee-datatable/', EmployeeListView.as_view(), name='api-employee-datatable'),
    path('api/department-datatable/', DepartmentListView.as_view(), name='api-department-datatable'),
    path('api/handle-employee/', EmployeeHandler.as_view(), name='api-handle-employee'),
    path('api/handle-department/', DepartmentHandler.as_view(), name='api-handle-department'),
]

urlpatterns = [
    path('', home_view, name='home'),
    path('employee-bulk-import/', employee_bulk_import_view, name='employee-bulk-import'),
    *api_urls
]