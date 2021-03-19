from django.contrib import admin

# Register your models here.
from employee.models import Department, Employee

admin.site.register(Department)
admin.site.register(Employee)