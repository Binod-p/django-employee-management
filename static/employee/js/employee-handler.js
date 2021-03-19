const dataTable = $("#employees-datatable");
const department_selector = $('.department-selector');
// const filter_department_selector = $('#advance-search-bar th > select.department-selector');
const alert_message_div_selector = $('#alert-message-div');
const delete_employee_id_modal_prompt = $('#deleteEmployeePrompt');
const add_employee_form_selector = $('#add-employee-form');
const edit_employee_form_selector = $('#edit-employee-form');
const add_department_form_selector = $('#add-department-form');

let datatable_first_time_load = true;

let employee_id_to_delete, employee_id_to_update;

const showAlert = (message, type = 'info', timeout = 3000) => {
    alert_message_div_selector.html(`<div class="alert alert-${type}" role="alert">${message}</div>`)
    alert_message_div_selector.show();
    setTimeout(function () {
        alert_message_div_selector.hide();
    }, timeout);
}

const handleMissingData = (obj, key, placeholder = '-') => {
    if (obj === null) {
        return placeholder;
    }
    const result = obj[key];
    return (typeof result !== "undefined") ? result : placeholder;
}

function loadEmployeesData() {
    return dataTable.DataTable({
        'ajax': '/api/employee-datatable/?format=datatables',
        'processing': true,
        "language": {
            processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>'
        },
        orderCellsTop: true,
        "scrollX": true,
        lengthMenu: [[5, 10, 50, 100, -1], [5, 10, 50, 100, "All"]],
        order: [],
        dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-2'><'col-sm-12 col-md-5'p>>" +
            "<'row'<'col text-right pt-3'B>>",
        buttons: ['excel'],
        'columns': [
            {'data': 'id'},
            {
                'data': 'first_name', render: function (data, type, full) {
                    return data + " " + full['last_name'];
                }
            },
            {'data': 'department', render: data => handleMissingData(data, 'name')},
            {'data': 'designation'},
            {'data': 'salary'},
            {'data': 'mobile_number'},
            {'data': 'join_date'},
            {
                'data': 'id', sortable: false, render: function (data, type, row) {
                    return `<a class="pr-3" role="button"><i class="fa fa-pen edit-employee" aria-hidden="true" data-toggle="modal" data-target="#editEmployeeModalForm" data-employee-id="${data}"></i></a>
                            <a class="" role="button"><i class="fa fa-trash delete-employee" aria-hidden="true" data-toggle="modal" data-target="#deleteEmployeePrompt" data-employee-id="${data}"></i></a>`;
                }
            },
        ],
        'drawCallback': function () {
            // if (datatable_first_time_load) {
            //     getDepartmentsAndAdd(true);
            //     datatable_first_time_load = false;
            // }
        }
    });
}

const addEmployeeDetails = function () {
    const data = getFormData(add_employee_form_selector);
    console.log(data);

    let url = "/api/handle-employee/"
    $.ajax(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function (data) {
            console.log(data);
            showAlert('Employee was added successfully!', 'success', 5000);
            add_employee_form_selector.trigger('reset');
            $('#addEmployeeModalForm').modal('hide');
            // dataTable.DataTable().draw(false);
            dataTable.DataTable().ajax.reload(null, false);
        },
        error: function () {
            showAlert('Employee data was not saved! Please try again.', 'danger');
        },
    });
}

function deleteEmployee() {
    const data = {'id': employee_id_to_delete}
    let url = "/api/handle-employee/";

    $.ajax(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function () {
            showAlert('Employee was deleted successfully!');
            delete_employee_id_modal_prompt.modal('hide');
            dataTable.DataTable().ajax.reload(null, false);
        },
        error: function () {
            showAlert('Could not delete Employee data! Please try again.', 'danger');
        },
    });
}

const updateEmployeeDetails = function () {
    let data = getFormData(edit_employee_form_selector)
    data['id'] = employee_id_to_update;
    console.log(data);

    let url = "/api/handle-employee/"
    $.ajax(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function (data) {
            console.log(data);
            showAlert('Employee data was updated successfully!');
            edit_employee_form_selector.trigger('reset');
            $('#editEmployeeModalForm').modal('hide');
            dataTable.DataTable().ajax.reload(null, false);
        },
        error: function () {
            console.error('Employee data was not saved! Please try again.');
        },
    });
}

function editEmployeeButtonAction() {
    let url = "/api/handle-employee/";

    $('#static-employee-id').empty().html(employee_id_to_update);

    $.getJSON(url, {id: employee_id_to_update}, function (response) {
        console.log(response);
        $.each(response, function (key, value) {
            let field_selector = $(`#edit-employee-form [name="${key}"]`);
            field_selector.val(value);
        })
    });
}

const addDepartmentDetails = function () {
    const data = getFormData(add_department_form_selector);
    console.log(data);

    let url = "/api/handle-department/"
    $.ajax(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function (data) {
            console.log(data);
            showAlert('Department was added successfully!');
            add_department_form_selector.trigger('reset');
            $('#addDepartmentModalForm').modal('hide');
            getDepartmentsAndAdd(true);
        },
        error: function () {
            console.error('Department data was not saved! Please try again.');
        },
    });
}

function getDepartmentsAndAdd(add_in_filters = false) {
    let url = '/api/department-datatable/'
    $.getJSON(url, {}, function (data) {
        console.log(data);
        addDepartmentsToSelector(department_selector, data)
        if (add_in_filters) {
            addDepartmentsToSelector($('#advance-search-bar th > select.department-selector'), data, true);
        }
    });
}

function addDepartmentsToSelector(selector, department_data, name_as_value = false) {
    // console.log(selector);
    selector.empty();
    selector.append('<option value="" selected disabled>Select Department</option>');
    for (const result of department_data) {
        const value = name_as_value ? result.name : result.id;
        selector.append(`<option value="${value}">${result.name}</option>`);
    }
}

function resetAdvanceSearch(table = $('.custom-datatable').DataTable()) {
    for (const x of $('#advance-search-bar th input')) {
        $(x).val('');
    }
    $('#advance-search-bar th select').val('');
    table.search('').columns().search('').draw();
}


//Event Handlers
add_employee_form_selector.submit(function (e) {
    e.preventDefault();
    addEmployeeDetails();
});

edit_employee_form_selector.submit(function (e) {
    e.preventDefault();
    updateEmployeeDetails();
});

add_department_form_selector.submit(function (e) {
    e.preventDefault();
    addDepartmentDetails();
});

dataTable.on('click', '.delete-employee', function () {
    employee_id_to_delete = this.getAttribute('data-employee-id');
    console.log(employee_id_to_delete)
    // delete_employee_id_modal_prompt.modal('show');
    $('#static-employee-id-delete').empty().html(employee_id_to_delete);
});

dataTable.on('click', '.edit-employee', function () {
    employee_id_to_update = this.getAttribute('data-employee-id');
    console.log(employee_id_to_delete)
    // delete_employee_id_modal_prompt.modal('show');
    editEmployeeButtonAction();
});

$('#employee-delete-yes').on('click', function (e) {
    deleteEmployee();
});

$('#toggle-advance-search-button').change(function () {
    if (this.checked) {
        $('#advance-search-bar').removeClass('d-none');
    } else {
        resetAdvanceSearch();
        $('#advance-search-bar').addClass('d-none');
    }
});

$(document).ready(function () {
    $('#employees-datatable thead tr').clone(true).appendTo('#employees-datatable thead').attr("id", "advance-search-bar").attr("class", "d-none my-2").attr("style", "background: #f8f9fa");
    $('#employees-datatable thead tr:eq(1) th').each(function (i) {
        $(this).html(`<input type="text" size="5" class="filter form-control form-control-sm ml-1"/>`);
        if (i === 7) {
            $(this).html('<div class="mb-1 ml-4" id="advance-search-clear-button" type="button" onclick="resetAdvanceSearch()"><i class="fa fa-times" style="font-size: larger" aria-hidden="true"></i></div>');
        } else if (i === 2) {
            $(this).html(`<select class="filter form-control form-control-sm department-selector ml-3" aria-label="Department"></select>`);
        } else if (i === 6) {
            $(this).html(`<input type="date" class="filter form-control form-control-sm"/>`);
        }
        $('.filter', this).on('keyup change', function () {
            if (table.column(i).search() !== this.value) {
                if (i === 1 && this.value !== "") {
                    table.column(i).search(this.value).draw();
                } else if (this.value !== "") {
                    table.column(i).search("^" + $(this).val(), true, false, true).draw();
                } else {
                    table.column(i).search(this.value).draw();
                }
            }
        });
    });
    const table = loadEmployeesData();
    getDepartmentsAndAdd(true);
});