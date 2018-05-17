/// <reference path="../../vendor/kendo/vsdoc/kendo.all.min.intellisense.js" />
/// <reference path="../../vendor/kendo/vsdoc/kendo.all-vsdoc.js" />

var components = {
    gridId: null,
    grid: null,
    formId: null,
    dialogId: null,
    state: null,
    webApiUrl: null
};
var token;

var registration = {
    modules: {
        account: null,
        user: null,
        vessel: null,
        engine: null,
        channel: null,
    },
    /* On Load */
    onload: function () {
        //get current token;
        if (!token) {
            if (localStorage.getItem(Settings.TokenKey)) token = localStorage.getItem(Settings.TokenKey).toString();
            else if ($.cookie(Settings.TokenKey)) token = $.cookie(Settings.TokenKey);
        }

        // resetting for all modal dialogs
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(this).find('form').bootstrapValidator("resetForm", true);
        });

        // initializing accounts related
        try {
            registration.modules.account = {
                gridId: '#table_accounts',
                formId: '#form_acc',
                dialogId: '#registration_acc',
                webApiUrl: Settings.WebApiUrl + '/api/KendoAccounts',
            };
            registration.retrieveAccounts(); // kendo grid id
            registration.SubmitAccount(); // Create, Update
        } catch (e) {
            console.log(e.message);
        }

        // initializing users related
        try {
            registration.modules.user = {
                gridId: '#table_users',
                formId: '#form_user',
                dialogId: '#registration_user',
                webApiUrl: Settings.WebApiUrl + '/api/KendoUsers',
            };
            registration.retrieveUsers(); // kendo grid id
            registration.SubmitUser(); // Create, Update
        } catch (e) {
            console.log(e.message);
        }
    },

    /* ----------------------------------------------------------------- Accounts -----------------------------------------------------------------*/
    retrieveAccounts: function () {
        var pageNumber = 1;
        var url = registration.modules.account.webApiUrl;

        // data source settings
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    // the remote service url
                    url: url,

                    // the request type
                    type: "get",

                    // the data type of the returned result
                    dataType: "json",

                    // passing token
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
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
        $(registration.modules.account.gridId).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true,
            selectable: "row",
            change: registration.accGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(registration.modules.account.gridId).data("kendoGrid");
        registration.modules.account.grid = grid;

        $('#btnEditAccount').prop('disabled', true);
        $('#btnDelAccount').prop('disabled', true);
    },

    SubmitAccount: function () {
        //var formId = "#" + formid;
        //var modalId = "#" + modalid;
        //var gridId = "#" + gridid;

        // validation
        $(registration.modules.account.formId).bootstrapValidator({
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
        })
        .on('success.form.bv', function (e) {
            // Prevent form submission
            e.preventDefault();
            var url = registration.modules.account.webApiUrl;
            var data = {
                AccountID : $('#accID').val(),
                Name : $('#accName').val(),
                PrimaryContact : $('#primary').val(),
                MainPhone : $('#phone').val(),
                Fax : $('#fax').val(),
                Email : $('#email').val()
            };
            var requestType = "POST"; // Create

            if (registration.modules.account.state === 'update') {
                data.id = $('#id').val();
                requestType = "PUT";
                url += '/' + data.id;
            }// Update

            $.ajax({
                type: requestType,
                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: 'json',
                // passing token
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(registration.modules.account.dialogId).modal('toggle'); 

                    $(registration.modules.account.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.account.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#btnAccSubmit").prop("disabled", false);
                }
            });
        });
    },

    accGrid_OnChange: function (arg) {
        var row = this.select();
        if (row) {
            $('#btnEditAccount').prop('disabled', false);
            $('#btnDelAccount').prop('disabled', false);
        }
    },

    btnNewAccount_OnClick: function () {
        registration.modules.account.state = 'create';
    },

    btnEditAccount_OnClick: function () {
        var accountGrid = registration.modules.account.grid;
        var selectedItem = accountGrid.dataItem(accountGrid.select());

        if (selectedItem) {
            $('#id').val(selectedItem.id);
            $('#accName').val(selectedItem.name);
            $('#accID').val(selectedItem.accountID);
            $('#primary').val(selectedItem.primaryContact);
            $('#phone').val(selectedItem.mainPhone);
            $('#fax').val(selectedItem.fax);
            $('#email').val(selectedItem.email);

            registration.modules.account.state = 'update';
        }
        else {
            $(registration.modules.account.dialogId).modal('hide'); 
        }
    },

    btnDelAccount_OnClick: function () {
        var accountGrid = registration.modules.account.grid;
        var selectedItem = accountGrid.dataItem(accountGrid.select());
        var url = registration.modules.account.webApiUrl + '/' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("Are you sure you want to delete \'" + selectedItem.name + "\' account?");
            if (!ans) return;

            $.ajax({
                type: 'DELETE',
                url: url,
                contentType: "application/json",
                data: null,
                dataType: 'json',
                // passing token
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(registration.modules.account.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.account.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                }
            });
        }
        else {
            $(registration.modules.account.dialogId).modal('hide');
        }
    },

    /* ----------------------------------------------------------------- Users -----------------------------------------------------------------*/

    retrieveUsers: function () {
        var pageNumber = 1;
        var url = registration.modules.user.webApiUrl;

        // data source settings
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    // the remote service url
                    url: url,

                    // the request type
                    type: "get",

                    // the data type of the returned result
                    dataType: "json",

                    // passing token
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
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
            sort: { field: "fullName", dir: "asc" }
        });

        // column settings
        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "fullName",
                title: "Full Name",
                filterable: {
                    extra: false
                }
            },
            {
                field: "jobTitle",
                title: "Job Title",
                filterable: false
            },
            {
                field: "name",
                title: "Company Name",
                filterable: {
                    extra: false
                }
            },
            {
                field: "email",
                title: "Email",
                filterable: {
                    extra: false
                }
            },
            {
                field: "businessPhoneNumber",
                title: "Office Phone",
                filterable: false
            },
            {
                field: "phoneNumber",
                title: "Mobile",
                filterable: false
            },
        ];

        // initialize grid
        $(registration.modules.user.gridId).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true,
            selectable: "row",
            change: registration.userGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(registration.modules.user.gridId).data("kendoGrid");
        registration.modules.user.grid = grid;

        $('#btnEditUser').prop('disabled', true);
        $('#btnDelUser').prop('disabled', true);
        $('#btnResetPassword').prop('disabled', true);
    },

    SubmitUser: function () {
        // initailize dropdown
        var dropdownParent = $('#userParent');
        dropdownParent.empty();

        const url = Settings.WebApiUrl + "/api/DropDown/ListAllAccounts";

        // Populate dropdown with list of provinces
        $.getJSON(url, function (data) {
            $.each(data, function (key, entry) {
                dropdownParent.append($('<option></option>').attr('value', entry.id).text(entry.name));
            })
        });


        // validation
        $(registration.modules.user.formId).bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                userName: {
                    validators: {
                        notEmpty: {
                            message: 'The user name is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The user name must be less than 100 characters long'
                        }
                    }
                },
                userParent: {
                    validators: {
                        notEmpty: {
                            message: 'The parent account (company) is required'
                        },
                    }
                },
                userTitle: {
                    validators: {
                        notEmpty: {
                            message: 'The job title is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The job title must be less than 100 characters long'
                        }
                    }
                },
                userPhone: {
                    validators: {
                        notEmpty: {
                            message: 'Office phone number is required'
                        },
                        stringLength: {
                            max: 20,
                            message: 'Office phone number must be less than 20 characters long'
                        }
                    }
                },
                userMobile: {
                    validators: {
                        notEmpty: {
                            message: 'Mobile phone number is required'
                        },
                        stringLength: {
                            max: 20,
                            message: 'Mobile phone number must be less than 20 characters long'
                        }
                    }
                },
                userEmail: {
                    validators: {
                        notEmpty: {
                            message: 'Email is required'
                        }
                    }
                }
            }
        })
        .on('success.form.bv', function (e) {
            // Prevent form submission
            e.preventDefault();
            var url = registration.modules.user.webApiUrl;
            var data = {
                fullName: $('#userName').val(),
                accountID: $('#userParent').val(),
                jobTitle: $('#userTitle').val(),
                businessPhoneNumber: $('#userPhone').val(),
                phoneNumber: $('#userMobile').val(),
                email: $('#userEmail').val()
            };
            var requestType = "POST"; // Create

            if (registration.modules.user.state === 'update') {
                data.id = $('#id').val();
                requestType = "PUT";
                url += '/' + data.id;
            }// Update

            $.ajax({
                type: requestType,
                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: 'json',
                // passing token
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(registration.modules.user.dialogId).modal('toggle');

                    $(registration.modules.user.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.user.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#btnUserSubmit").prop("disabled", false);
                }
            });
        });
    },

    userGrid_OnChange: function (arg) {
        var row = this.select();
        if (row) {
            $('#btnEditUser').prop('disabled', false);
            $('#btnDelUser').prop('disabled', false);
            $('#btnResetPassword').prop('disabled', false);
        }
    },

    btnNewUser_OnClick: function () {
        registration.modules.user.state = 'create';
        registration.SubmitUser();
    },

    btnEditUser_OnClick: function () {
        var userGrid = registration.modules.user.grid;
        var selectedItem = userGrid.dataItem(userGrid.select());

        if (selectedItem) {
            $('#id').val(selectedItem.id);
            $('#userName').val(selectedItem.fullName);
            $('#userParent').val(selectedItem.accountID);
            $('#userTitle').val(selectedItem.jobTitle);
            $('#userPhone').val(selectedItem.businessPhoneNumber);
            $('#userMobile').val(selectedItem.phoneNumber);
            $('#userEmail').val(selectedItem.email);

            registration.modules.user.state = 'update';
            registration.SubmitUser();
        }
        else {
            $(registration.modules.account.dialogId).modal('hide');
        }
    },

    btnDelUser_OnClick: function () {
        var userGrid = registration.modules.user.grid;
        var selectedItem = userGrid.dataItem(userGrid.select());
        var url = registration.modules.user.webApiUrl + '/' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("Are you sure you want to delete \'" + selectedItem.name + "\' user?");
            if (!ans) return;

            $.ajax({
                type: 'DELETE',
                url: url,
                contentType: "application/json",
                data: null,
                dataType: 'json',
                // passing token
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(registration.modules.user.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.user.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#btnUserSubmit").prop("disabled", false);
                }
            });
        }
        else {
            $(registration.modules.user.dialogId).modal('hide');
        }
    },

    btnResetPassword_OnClick: function () {
        var userGrid = registration.modules.user.grid;
        var selectedItem = userGrid.dataItem(userGrid.select());
        var url = Settings.WebApiUrl + '/api/User/UserPasswordReset?id=' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("New password will send to user email (" + selectedItem.email + "). Do you want to continue?");
            if (!ans) return;

            $.ajax({
                type: 'GET',
                url: url,
                contentType: "application/json",
                data: null,
                dataType: 'json',
                // passing token
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                }
            });
        }
        else {
            $(registration.modules.user.dialogId).modal('hide');
        }
    },
};