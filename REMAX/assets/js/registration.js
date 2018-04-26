var registration = {
    onload: function () {
        registration.retrieveAccounts();
    },

    retrieveAccounts() {
        var pageNumber = 1;
        var pageSize = $('#pagesizeaccounts').val();
        var columnName = 'AccountName';
        var columnSorting = 'asc';

        var queryString = 'pageNumber=' + (pageNumber?pageNumber:1)
                            + '&pageSize=' + (pageSize ? pageSize : 10)
                            + '&sorting=' + columnName + encodeURI(' ') + columnSorting

        var generateAccountTable = $("#table_accounts")
            .DataTable({
                "processing": true,
                "serverSide": true,
                "columnDefs": [
                    { "visible": false, "targets": 0 }
                ],
                "ajax": {
                    "url": Settings.WebApiUrl + '/api/Accounts'
                },
                "columns": [
                    { "data": "id" }, { "data": "name" }, { "data": "accountID" }, { "data": "primaryContact" }, { "data": "mainPhone" }
                    , { "data": "fax" }, { "data": "email" }
                    
                ],
                "language": {
                    "emptyTable": "There are no customers at present.",
                    "zeroRecords": "There were no matching customers found."
                },
                "searching": false,
                "ordering": true,
                "paging": true
            });
    }
}