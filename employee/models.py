from django.db import models


# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name


class Employee(models.Model):
    """

    """
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, blank=True, null=True)
    designation = models.CharField(max_length=50, blank=True, null=True)
    salary = models.IntegerField(blank=True, null=True)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    join_date = models.DateField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Employees"

    def __str__(self):
        return f'{self.first_name} {self.last_name} | {self.department} | {self.mobile_number}'
