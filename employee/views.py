from django.http import Http404
from django.shortcuts import render

# Create your views here.
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from employee.helper import parse_xml_and_save_employee_data
from employee.models import Employee, Department
from employee.serializers import EmployeeSerializer, DepartmentSerializer, EmployeeDatatableSerializer


def home_view(request):
    return render(request, 'employee/home.html', {})


# API Views
class EmployeeHandler(APIView):
    """
    Get, Update or Delete an Employee instance.
    """

    @staticmethod
    def get_object(pk):
        try:
            return Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            raise Http404

    @staticmethod
    def post(request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        employee = self.get_object(request.GET['id'])
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    def put(self, request):
        employee = self.get_object(request.data['id'])
        serializer = EmployeeSerializer(employee, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        employee = self.get_object(request.data['id'])
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DepartmentHandler(APIView):
    """
    Get, Update or Delete a Department instance.
    """

    @staticmethod
    def get_object(pk):
        try:
            return Department.objects.get(pk=pk)
        except Department.DoesNotExist:
            raise Http404

    @staticmethod
    def post(request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            department_obj, created = Department.objects.get_or_create(name=request.data['name'])
            if created:
                department_obj.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        department = self.get_object(request.GET['id'])
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)

    def put(self, request, pk):
        department = self.get_object(request.data['id'])
        serializer = DepartmentSerializer(department, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        department = self.get_object(request.data['id'])
        department.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmployeeListView(generics.ListAPIView):
    queryset = Employee.objects.all().order_by('-id')
    serializer_class = EmployeeDatatableSerializer


class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    pagination_class = None


def employee_bulk_import_view(request):
    csv_file = request.FILES.get('employee_data_file')
    if csv_file:
        filename = csv_file.name
        if filename.endswith('.csv'):
            context = parse_xml_and_save_employee_data(csv_file)
        else:
            context = {'message': 'Please upload file ending with .csv',
                       'class': 'alert-danger'}
        return render(request, 'employee/employee-bulk-import.html', context)
    return render(request, 'employee/employee-bulk-import.html', {})
