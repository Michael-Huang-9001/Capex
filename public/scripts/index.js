$(document).ready(() => {

    $("#add_row").click(function (e) {
        let table = $('#form_table');
        console.log(table.find('tbody tr').length);

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
});
