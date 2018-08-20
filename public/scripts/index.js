let row_count = 1;

$(document).ready(() => {
    row_count = $('#form_table > tbody > tr').length;

    $("#add_row").click(function (e) {
        let table = $('#form_table');
        //console.log(table.find('tbody tr').length);

        table.find('tbody').append('<tr><td>' +
            '<input type="text" class="form-control" placeholder="Customer name" name="form[' + row_count + '][name]" value=""/>' +
            '</td>' +
            '<td>' +
            '<input type="number" class="form-control" placeholder="Data size" min="0" step="0.01" name="form[' + row_count++ + '][size]" value=""/>' +
            '</td>' +
            '<td><i class="fa fa-trash" aria-hidden="true" onclick="delete_row(this);"></i></td>' +
            '</tr>');
    });

    $("#delete_row").click(function (e) {
        let table = $('#form_table');

        if (table.find('tbody tr').length > 1) {
            table.find('tbody tr:last-child').remove();
        }
    });

    $("#email_button").click(function (e) {
        // alert(window.location);
        let form = $("#form");
        // console.log(form.find('#location').val());
        // console.log(form.find('#form_table').html());
        // console.log(form.find('#results_table').html());

        let json = {
            type: "POST",
            timeout: 5000,
            url: window.location + 'email',
            dataType: 'json',
            data: {
                email: form.find('#email').val(),
                location: form.find('#location').val(),
                form: form.find('#form_table').html().replace(/type="number"/g, 'type="text"'),
                // strips all input numbers for older versions of outlook
                total_size: form.find('#total_size').html(),
                results: form.find('#results_table').html(),
                results_text: form.find('#results_text').html()
            },
            success: function (res) {
                if (res.status == 200) {
                    alert(res.message);
                } else {
                    alert("Email not sent.");
                }
            },
            error: function (xhr, status, error) {
                alert('An error has occurred when sending the email.');
            }
        };

        $.ajax(json);
    });

});

function delete_row(row) {
    if ($('#form_table > tbody > tr').length > 1) {
        $(row).parent().parent().remove();
    }
}

function calc_cost(hosts, input, id) {
    //alert('Calc called')
    $(id).html(hosts * $(input).val());
    $('#total_cost').text(Number($('#blob_cost').text()) + Number($('#struct_cost').text()) + Number(Number($('#index_cost').text())));
    //alert(Number($('#blob_cost').text()) + Number($('#struct_cost').text()) + Number(Number($('#index_cost').text())));
}