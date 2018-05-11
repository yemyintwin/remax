/// <reference path="../../vendor/kendo/vsdoc/kendo.all.min.intellisense.js" />
/// <reference path="../../vendor/kendo/vsdoc/kendo.all-vsdoc.js" />
var registration = {
    onload: function () {
        //debugger;

        // resetting for all modal dialogs
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(this).find('form').bootstrapValidator("resetForm", true);
        });

        registration.retrieveAccounts('table_accounts'); // kendo grid id
        registration.registerNewAccount('form_acc', 'registration_acc', 'table_accounts'); // from id, modal id, kendo grid id

        registration.retrieveUsers('table_accounts'); // kendo grid id
        registration.registerNewUser('form_user', 'registration_user', 'table_users'); // from id, modal id, kendo grid id
    },

    //retrieveAccounts_DataTable: function() {
    //    var pageNumber = 1;
    //    var pageSize = $('#pagesizeaccounts').val();
    //    var columnName = 'AccountName';
    //    var columnSorting = 'asc';

    //    var queryString = 'pageNumber=' + (pageNumber?pageNumber:1)
    //                        + '&pageSize=' + (pageSize ? pageSize : 10)
    //                        + '&sorting=' + columnName + encodeURI(' ') + columnSorting

    //    var generateAccountTable = $("#table_accounts")
    //        .DataTable({
    //            "processing": true,
    //            "serverSide": true,
    //            "columnDefs": [
    //                { "visible": false, "targets": 0 }
    //            ],
    //            "ajax": {
    //                "url": Settings.WebApiUrl + '/api/Accounts'
    //            },
    //            "columns": [
    //                { "data": "id" }, { "data": "name" }, { "data": "accountID" }, { "data": "primaryContact" }, { "data": "mainPhone" }
    //                , { "data": "fax" }, { "data": "email" }

    //            ],
    //            "language": {
    //                "emptyTable": "There are no customers at present.",
    //                "zeroRecords": "There were no matching customers found."
    //            },
    //            "searching": false,
    //            "ordering": true,
    //            "paging": true
    //        });
    //},

    /* */
    retrieveAccounts: function (gridid) {
        var pageNumber = 1;
        var url = Settings.WebApiUrl + "/api/KendoAccount";
        var gridName = "#" + gridid;

        // data source settings
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    // the remote service url
                    url: url,

                    // the request type
                    type: "get",

                    // the data type of the returned result
                    dataType: "json"
                },
                parameterMap: function (data, type) {
                    if (type === "read") {
                        // send take as "$top" and skip as "$skip"
                        return {
                            aggregate: data.aggregate,
                            group: data.group,
                            filter: data.filter,
                            models: data.models,
                            page: data.page,
                            pageSize: data.pageSize,
                            take: data.take,
                            skip: data.skip,
                            sort: data.sort
                        };
                    }
                }
            },
            // describe the result format
            schema: {
                data: "data", // records are returned in the "data" field of the response
                total: "total" // total number of records is in the "total" field of the response
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: { field: "AccountID", dir: "asc" }
        });

        // column settings
        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "accountID",
                title: "Account ID",
                filterable: {
                    extra: false
                }
            },
            {
                field: "name",
                title: "Name",
                filterable: {
                    extra: false
                }
            },
            {
                field: "primaryContact",
                title: "Primary Contact",
                filterable: false
            },
            {
                field: "mainPhone",
                title: "Phone",
                filterable: false
            },
            {
                field: "fax",
                title: "Fax",
                filterable: false
            },
            {
                field: "email",
                title: "Email",
                filterable: false
            }
        ];

        // initialize grid
        $(gridName).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true,
            selectable: "row"
        });

        var grid = $(gridName).data("kendoGrid");
        grid.bind("sort", function (e) {
            return;
        });
    },

    registerNewAccount: function (formid, modalid, gridid) {
        var formId = "#" + formid;
        var modalId = "#" + modalid;
        var gridId = "#" + gridid;

        // validation
        $(formId).bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                accName: {
                    validators: {
                        notEmpty: {
                            message: 'The account name is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The account name must be less than 100 characters long'
                        }
                    }
                },
                accID: {
                    validators: {
                        notEmpty: {
                            message: 'The account ID is required'
                        },
                        stringLength: {
                            max: 50,
                            message: 'The account ID must be less than 50 characters long'
                        }
                    }
                },
                primary: {
                    validators: {
                        notEmpty: {
                            message: 'The primary contact is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The primary contact must be less than 100 characters long'
                        }
                    }
                },
                phone: {
                    validators: {
                        notEmpty: {
                            message: 'Phone number is required'
                        },
                        stringLength: {
                            max: 20,
                            message: 'Phone number must be less than 20 characters long'
                        }
                    }
                },
                email: {
                    validators: {
                        notEmpty: {
                            message: 'Email is required'
                        }
                    }
                }
            }
        }).on('success.form.bv', function (e) {
            // Prevent form submission
            e.preventDefault();
            var url = Settings.WebApiUrl + "/api/KendoAccount";
            var data = {
                AccountID : $('#accID').val(),
                Name : $('#accName').val(),
                PrimaryContact : $('#primary').val(),
                MainPhone : $('#phone').val(),
                Fax : $('#fax').val(),
                Email : $('#email').val()
            };
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(modalId).modal('toggle'); 

                    $(gridId).data('kendoGrid').dataSource.read();
                    $(gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#submit_acc").prop("disabled", false);
                }
            });
        });
    },

    retrieveUsers: function (gridid) {
        var pageNumber = 1;
        var url = Settings.WebApiUrl + "/api/KendoAccount";
        var gridName = "#" + gridid;

        // data source settings
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    // the remote service url
                    url: url,

                    // the request type
                    type: "get",

                    // the data type of the returned result
                    dataType: "json"
                },
                parameterMap: function (data, type) {
                    if (type === "read") {
                        // send take as "$top" and skip as "$skip"
                        return {
                            aggregate: data.aggregate,
                            group: data.group,
                            filter: data.filter,
                            models: data.models,
                            page: data.page,
                            pageSize: data.pageSize,
                            take: data.take,
                            skip: data.skip,
                            sort: data.sort
                        };
                    }
                }
            },
            // describe the result format
            schema: {
                data: "data", // records are returned in the "data" field of the response
                total: "total" // total number of records is in the "total" field of the response
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: { field: "AccountID", dir: "asc" }
        });

        // column settings
        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "accountID",
                title: "Account ID",
                filterable: {
                    extra: false
                }
            },
            {
                field: "name",
                title: "Name",
                filterable: {
                    extra: false
                }
            },
            {
                field: "primaryContact",
                title: "Primary Contact",
                filterable: false
            },
            {
                field: "mainPhone",
                title: "Phone",
                filterable: false
            },
            {
                field: "fax",
                title: "Fax",
                filterable: false
            },
            {
                field: "email",
                title: "Email",
                filterable: false
            }
        ];

        // initialize grid
        $(gridName).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true
        });

        var grid = $(gridName).data("kendoGrid");
        grid.bind("sort", function (e) {
            return;
        });
    },

    registerNewUser: function (formid, modalid, gridid) {
        var formId = "#" + formid;
        var modalId = "#" + modalid;
        var gridId = "#" + gridid;

        // validation
        $(formId).bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                accName: {
                    validators: {
                        notEmpty: {
                            message: 'The account name is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The account name must be less than 100 characters long'
                        }
                    }
                },
                accID: {
                    validators: {
                        notEmpty: {
                            message: 'The account ID is required'
                        },
                        stringLength: {
                            max: 50,
                            message: 'The account ID must be less than 50 characters long'
                        }
                    }
                },
                primary: {
                    validators: {
                        notEmpty: {
                            message: 'The primary contact is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The primary contact must be less than 100 characters long'
                        }
                    }
                },
                phone: {
                    validators: {
                        notEmpty: {
                            message: 'Phone number is required'
                        },
                        stringLength: {
                            max: 20,
                            message: 'Phone number must be less than 20 characters long'
                        }
                    }
                },
                email: {
                    validators: {
                        notEmpty: {
                            message: 'Email is required'
                        }
                    }
                }
            }
        }).on('success.form.bv', function (e) {
            // Prevent form submission
            e.preventDefault();
            var url = Settings.WebApiUrl + "/api/KendoAccount";
            var data = {
                AccountID: $('#accID').val(),
                Name: $('#accName').val(),
                PrimaryContact: $('#primary').val(),
                MainPhone: $('#phone').val(),
                Fax: $('#fax').val(),
                Email: $('#email').val()
            };
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(modalId).modal('toggle');

                    $(gridId).data('kendoGrid').dataSource.read();
                    $(gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#submit_acc").prop("disabled", false);
                }
            });
        });
    }
};