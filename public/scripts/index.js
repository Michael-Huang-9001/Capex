$(document).ready(() => {

    $("#add_row").click(function (e) {
        let table = $('#form_table');
        //console.log(table.find('tbody tr').length);

        table.find('tbody').append('<tr><td>' +
            '<input type="text" class="form-control" placeholder="Customer name" name="form[' + table.find('tbody tr').length + '][name]" value=""/>' +
            '</td>' +
            '<td>' +
            '<input type="number" class="form-control" placeholder="Data size" min="0" step="0.01" name="form[' + table.find('tbody tr').length + '][size]" value=""/>' +
            '</td></tr>');
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
                location: form.find('#location').val(),
                form: form.find('#form_table').html(),
                results: form.find('#results_table').html()
            },
            success: function (res) {
                if (res.status == 200) {
                    alert(res.success);
                } else {
                    alert("Email not sent.");
                }
            },
            error: function (xhr, status, error) {
                alert('An error has occurred when sending the email.');
            }
        };

        $.ajax(json);
    })
});
