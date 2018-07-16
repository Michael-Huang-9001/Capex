let rows = $('#customer_list tbody tr');

// Used for searching/filtering customer names
$('#search_box').keyup(function () {

    let val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

    rows.show().filter(function () {
        //alert($(this).text());
        let text = $(this).find(".column1").text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});