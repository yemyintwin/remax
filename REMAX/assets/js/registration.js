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
            //if (localStorage.getItem(Settings.TokenKey)) tokenObject = JSON.parse(localStorage.getItem(Settings.TokenKey));
            //else if ($.cookie(Settings.TokenKey)) tokenObject = JSON.parse($.cookie(Settings.TokenKey));

            //if (tokenObject && tokenObject.access_token) {
            //    token = tokenObject.access_token;
            //}

            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
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

        // initializing vessel related
        try {
            registration.modules.vessel = {
                gridId: '#table_vessels',
                formId: '#form_vessel',
                dialogId: '#registration_vessel',
                photoFormId: '#form_vessel_photo',
                photoDialogId:'#registration_vessel_photo',
                webApiUrl: Settings.WebApiUrl + '/api/KendoVessels',
            };
            registration.retrieveVessels(); // kendo grid id
            registration.SubmitVessel(); // Create, Update
            registration.VesselPhotoSubmit();
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

    SubmitUserInitControls: function () {
        // initailize dropdown
        var dropdownParent = $('#userParent');
        dropdownParent.empty();

        const url = Settings.WebApiUrl + "/api/DropDown/ListAllAccounts";

        // Populate dropdown with list of provinces
        //$.getJSON(url, function (data) {
        //    $.each(data, function (key, entry) {
        //        dropdownParent.append($('<option></option>').attr('value', entry.id).text(entry.name));
        //    })
        //});

        $.ajax({
            url: url,
            dataType: 'json',
            async:false,
            success: function (data) {
                //Process data retrieved
                $.each(data, function (key, entry) {
                    dropdownParent.append($('<option></option>').attr('value', entry.id).text(entry.name));
                });
            }
        });

    },

    SubmitUser: function () {
        registration.SubmitUserInitControls();

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
        registration.SubmitUserInitControls();
    },

    btnEditUser_OnClick: function () {
        var userGrid = registration.modules.user.grid;
        var selectedItem = userGrid.dataItem(userGrid.select());

        if (selectedItem) {
            registration.modules.user.state = 'update';
            registration.SubmitUserInitControls();

            $('#id').val(selectedItem.id);
            $('#userName').val(selectedItem.fullName);
            $('#userParent').val(selectedItem.accountID);
            $('#userTitle').val(selectedItem.jobTitle);
            $('#userPhone').val(selectedItem.businessPhoneNumber);
            $('#userMobile').val(selectedItem.phoneNumber);
            $('#userEmail').val(selectedItem.email);
        }
        else {
            $(registration.modules.user.dialogId).modal('hide');
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

    /* ----------------------------------------------------------------- Vessels -----------------------------------------------------------------*/

    retrieveVessels: function () {
        var pageNumber = 1;
        var url = registration.modules.vessel.webApiUrl;

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
            sort: { field: "vesselName", dir: "asc" }
        });

        // column settings
        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "imO_No",
                title: "IMO No.",
                filterable: {
                    extra: false
                },
                width: 100
            },
            {
                field: "vesselName",
                title: "Vessel Name",
                filterable: {
                    extra: false
                },
                width: 200
            },
            {
                field: "ownerAccount",
                title: "Owner",
                filterable: {
                    extra: false
                },
                width: 200,
                template: function (dataItem) {
                    return (dataItem.ownerAccount && dataItem.ownerAccount.name ? dataItem.ownerAccount.name : '');
                }
            },
            {
                field: "operatorAccount",
                title: "Operator",
                filterable: {
                    extra: false
                },
                width: 200,
                template: function (dataItem) {
                    return (dataItem.operatorAccount && dataItem.operatorAccount.name ? dataItem.operatorAccount.name : '');
                }
            },
            {
                field: "shipType",
                title: "Ship Type",
                width: 100,
                filterable: false,
                template: function (dataItem) {
                    return (dataItem.shipType && dataItem.shipType.name ? dataItem.shipType.name : '');
                }
            },
            {
                field: "shipyardName",
                title: "Shipyard Name",
                width: 200,
                filterable: false
            },
            {
                field: "buildYear",
                title: "Build Year",
                filterable: false,
                width: 100,
                template: function (dataItem) {
                    return (dataItem.buildYear ? new Date(dataItem.buildYear).toLocaleDateString() : '');
                }
            },
            {
                field: "deliveryToOwner",
                title: "Delivery To Owner",
                filterable: false,
                width: 200,
                template: function (dataItem) {
                    return (dataItem.deliveryToOwner ? new Date(dataItem.deliveryToOwner).toLocaleDateString() : '');
                }
            },
            {
                field: "shipClass",
                title: "Ship Class",
                filterable: false,
                template: function (dataItem) {
                    return (dataItem.shipClass && dataItem.shipClass.name?dataItem.shipClass.name:'');
                },
                width: 100,
            },
            {
                field: "dwt",
                title: "DWT",
                filterable: false,
                width: 100,
            },
            {
                field: "shipyardName",
                title: "Shipyard Name",
                filterable: false,
                width: 200,
            },
            {
                field: "totalPropulsionPower",
                title: "Total Propulsion Power",
                filterable: false,
                width: 100,
            },
            {
                field: "totalGeneratorPower",
                title: "TotalGeneratorPower",
                filterable: false,
                width: 100,
            },
        ];

        // initialize grid
        $(registration.modules.vessel.gridId).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            scrollable: true,
            resizable: true,
            pageable: true,
            selectable: "row",
            change: registration.vesselGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(registration.modules.vessel.gridId).data("kendoGrid");
        registration.modules.vessel.grid = grid;

        $('#btnEditVessel').prop('disabled', true);
        $('#btnDelVessel').prop('disabled', true);
        $('#btnUploadVesselPhoto').prop('disabled', true);
    },

    SubmitVesselInitControls: function () {
        // initailize dropdown

        $("#vessel_builtYear").datepicker({
            format: " yyyy", // Notice the Extra space at the beginning
            viewMode: "years",
            minViewMode: "years"
        });
        $("#vessel_ownYear").datepicker({
            format: " yyyy", // Notice the Extra space at the beginning
            viewMode: "years",
            minViewMode: "years"
        });

        // Populate dropdown with list of accounts
        var dropdownOwner = $('#vessel_owner');
        dropdownOwner.empty();
        var dropdownOperator = $('#vessel_operator');
        dropdownOperator.empty();
        var url = Settings.WebApiUrl + "/api/DropDown/ListAllAccounts";
        //$.getJSON(url, function (data) {
        //    $.each(data, function (key, entry) {
        //        dropdownOwner.append($('<option></option>').attr('value', entry.id).text(entry.name));
        //        dropdownOperator.append($('<option></option>').attr('value', entry.id).text(entry.name));
        //    })
        //});

        $.ajax({
            url: url,
            dataType: 'json',
            async: false,
            success: function (data) {
                //Process data retrieved
                $.each(data, function (key, entry) {
                    dropdownOwner.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    dropdownOperator.append($('<option></option>').attr('value', entry.id).text(entry.name));
                });
            }
        });

        // Populate dropdown with list of country
        var dropdownShipyardCountry = $('#vessel_shipyardCountry');
        dropdownShipyardCountry.empty();
        var url = Settings.WebApiUrl + "/api/DropDown/ListAllCountry";
        $.getJSON(url, function (data) {
            $.each(data, function (key, entry) {
                dropdownShipyardCountry.append($('<option></option>').attr('value', entry.id).text(entry.name));
            })
        });

        // Populate dropdown with list of ship types
        var dropdownShipType = $('#vessel_shipType');
        dropdownShipType.empty();
        var url = Settings.WebApiUrl + "/api/DropDown/ListAllShipType";
        $.getJSON(url, function (data) {
            $.each(data, function (key, entry) {
                dropdownShipType.append($('<option></option>').attr('value', entry.id).text(entry.name));
            })
        });

        // Populate dropdown with list of ship classes
        var dropdownShipClass = $('#vessel_class');
        dropdownShipClass.empty();
        var url = Settings.WebApiUrl + "/api/DropDown/ListAllShipClass";
        $.getJSON(url, function (data) {
            $.each(data, function (key, entry) {
                dropdownShipClass.append($('<option></option>').attr('value', entry.id).text(entry.name));
            })
        });
    },

    SubmitVessel: function () {
        
        registration.SubmitVesselInitControls();

        // validation
        $(registration.modules.vessel.formId).bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                vessel_Name: {
                    validators: {
                        notEmpty: {
                            message: 'Vessel name is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'Vessel name must be less than 100 characters long'
                        }
                    }
                },
                vessel_imo: {
                    validators: {
                        notEmpty: {
                            message: 'IMO number is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'IMO number must be less than 50 characters long'
                        }
                    }
                },
                vessel_owner: {
                    validators: {
                        notEmpty: {
                            message: 'Vessel owner is required'
                        },
                    }
                },
                vessel_operator: {
                    validators: {
                        notEmpty: {
                            message: 'Vessel operator is required'
                        },
                    }
                },
                vessel_shipType: {},
                vessel_shipyard: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Vessel shipyard name must be less than 100 characters long'
                        }
                    }
                },
                vessel_shipyardCountry: {},
                vessel_builtYear: {},
                vessel_ownYear: {},
                vessel_class: {},
                vessel_dwt: {},
                vessel_propulsion: {},
                vessel_generator: {},
            }
        })
        .on('success.form.bv', function (e) {
                // Prevent form submission
                e.preventDefault();
                var url = registration.modules.vessel.webApiUrl;
                var data = {
                    iMo_no: $('#vessel_imo').val(),
                    vesselName: $('#vessel_Name').val(),
                    ownerId: $('#vessel_owner').val(),
                    operatorId: $('#vessel_operator').val(),
                    shipTypeId: $('#vessel_shipType').val(),
                    shipyardName: $('#vessel_shipyard').val(),
                    shipyardCountry: $('#vessel_shipyardCountry').val(),
                    buildYear: $('#vessel_builtYear').val() ? new Date($('#vessel_builtYear').val()) : null,
                    deliveryToOwner: $('#vessel_ownYear').val() ? new Date($('#vessel_ownYear').val()) : null,
                    shipClassId: $('#vessel_class').val(),
                    dwt: $('#vessel_dwt').val(),
                    totalPropulsionPower: $('#vessel_propulsion').val(),
                    totalGeneratorPower: $('#vessel_generator').val()
                };
                var requestType = "POST"; // Create

                if (registration.modules.vessel.state === 'update') {
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

                        $(registration.modules.vessel.dialogId).modal('toggle');

                        $(registration.modules.vessel.gridId).data('kendoGrid').dataSource.read();
                        $(registration.modules.vessel.gridId).data('kendoGrid').refresh();
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

    vesselGrid_OnChange: function (arg) {
        var row = this.select();
        if (row) {
            $('#btnEditVessel').prop('disabled', false);
            $('#btnDelVessel').prop('disabled', false);
            $('#btnUploadVesselPhoto').prop('disabled', false);
        }
    },

    btnNewVessel_OnClick: function () {
        registration.modules.vessel.state = 'create';
        registration.SubmitVesselInitControls();
    },

    btnEditVessel_OnClick: function () {
        var vesselGrid = registration.modules.vessel.grid;
        var selectedItem = vesselGrid.dataItem(vesselGrid.select());

        if (selectedItem) {
            registration.modules.vessel.state = 'update';
            registration.SubmitVesselInitControls();

            $('#id').val(selectedItem.id);
            $('#vessel_imo').val(selectedItem.imO_No);
            $('#vessel_Name').val(selectedItem.vesselName);
            $('#vessel_owner').val(selectedItem.ownerID);
            $('#vessel_operator').val(selectedItem.operatorID);
            $('#vessel_shipType').val(selectedItem.shipTypeID);
            $('#vessel_shipyard').val(selectedItem.shipyardName);
            $('#vessel_shipyardCountry').val(selectedItem.shipyardCountry);
            $('#vessel_builtYear').val(selectedItem.buildYear);
            $('#vessel_ownYear').val(selectedItem.deliveryToOwner);
            $('#vessel_class').val(selectedItem.shipClassID);
            $('#vessel_dwt').val(selectedItem.dwt);
            $('#vessel_propulsion').val(selectedItem.totalPropulsionPower);
            $('#vessel_generator').val(selectedItem.totalGeneratorPower);
        }
        else {
            $(registration.modules.vessel.dialogId).modal('hide');
        }
    },

    btnDelVessel_OnClick: function () {
        var vesselGrid = registration.modules.vessel.grid;
        var selectedItem = vesselGrid.dataItem(vesselGrid.select());
        var url = registration.modules.vessel.webApiUrl + '/' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("Are you sure you want to delete \'" + selectedItem.vesselName + "\' vessel?");
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

                    $(registration.modules.vessel.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.vessel.gridId).data('kendoGrid').refresh();
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
            $(registration.modules.vessel.dialogId).modal('hide');
        }
    },

    VesselPhotoSubmit: function () {
        $("#vesselPhoto").kendoUpload({
            async: {
                // will apend file name before uploading (upload event)
                saveUrl: registration.modules.vessel.webApiUrl + '/UploadPhoto', 
                autoUpload: false,
            },
            multiple: false,
            upload: function onUpload(e) {
                if (e.files.length != 1) {
                    alert("No file to upload");
                    e.preventDefault();
                }

                // Setting file name on server
                var vesselGrid = registration.modules.vessel.grid;
                var selectedItem = vesselGrid.dataItem(vesselGrid.select());
                var fileName = selectedItem.id + e.files[0].extension.toLowerCase();
                e.sender.options.async.saveUrl = registration.modules.vessel.webApiUrl + '/UploadPhoto?fileName=' + fileName;

                // Adding header
                var xhr = e.XMLHttpRequest;
                xhr.addEventListener("readystatechange", function (e) {
                    if (xhr.readyState == 1 /* OPENED */) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    }
                });

                // An array with information about the uploaded files
                var files = e.files;

                // Checks the extension of each file and aborts the upload if it is not .jpg
                $.each(files, function () {
                    if (this.extension.toLowerCase() != ".jpg" && this.extension.toLowerCase() != ".png") {
                        alert("Only .jpg or .png files can be uploaded");
                        e.preventDefault();
                    }
                });
            },
            error: function onError(e) { },
            success: function onSuccess() {
                $(registration.modules.vessel.photoDialogId).modal('hide');
            }
        });
    },
};