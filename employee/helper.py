from dateutil import parser

from rest_framework import serializers
from xlrd import open_workbook
import pandas as pd

from employee.models import Department
from employee.serializers import EmployeeSerializer


def parse_xml_and_save_employee_data(csv_file):
    error_items = []
    message = 'Import Success'
    class_alert = 'alert-info'
    df = pd.read_csv(csv_file, header=0)

    for index, row in df.iterrows():
        data = dict(row)
        department = data.pop('department')
        join_date_str = data.pop('join_date')

        serializer = EmployeeSerializer(data=data, partial=True)
        if serializer.is_valid():
            department_obj, created = Department.objects.get_or_create(name=department)
            join_date = parser.parse(join_date_str).date()

            data['department'] = department_obj.id
            data['join_date'] = join_date

            new_serializer = EmployeeSerializer(data=data, partial=True)
            if new_serializer.is_valid():
                new_serializer.save()
            else:
                error_items.append(data)
                message = 'Error'
                class_alert = 'alert-danger'

    return {'message': message, 'error_items': error_items, 'class': class_alert}


# if __name__ == '__main__':
#     parse_xml_and_save_employee_data()