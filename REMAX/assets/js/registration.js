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

    dropdownlist: 
        [
            {
                ctrl: 'vessel_owner',
                method: 'ListAllAccounts'
            },
            {
                ctrl: 'vessel_operator',
                method: 'ListAllAccounts'
            },
            {
                ctrl: 'vessel_shipyardCountry',
                method: 'ListAllCountry'
            },
            {
                ctrl: 'vessel_shipType',
                method: 'ListAllShipType'
            },
            {
                ctrl: 'vessel_class',
                method: 'ListAllShipClass'
            },
            {
                ctrl: 'engine_vessel',
                method: 'ListAllVessels'
            },
            {
                ctrl: 'engine_type',
                method: 'ListAllEngineTypes'
            },
            {
                ctrl: 'engine_alternatorMaker',
                method: 'ListAllAlternatorMakers'
            },
            {
                ctrl: 'engine_model',
                method: 'ListAllModels'
            },
        ],

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

        // Modal dialog hide event
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(this).find('form').bootstrapValidator("resetForm", true); //reset forms
            $('.modal:visible').length && $(document.body).addClass('modal-open'); //reset scrollbar setting
        });

        Util.displayLoading(document.body, true); //show loading and hide when all channels are loaded

        setTimeout(function () {
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
                $("#userRole").kendoMultiSelect();
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
                    photoDialogId: '#registration_vessel_photo',
                    webApiUrl: Settings.WebApiUrl + '/api/KendoVessels',
                };
                registration.retrieveVessels(); // kendo grid id
                registration.SubmitVessel(); // Create, Update
                registration.VesselPhotoSubmit();
            } catch (e) {
                console.log(e.message);
            }

            // initializing engine related
            try {
                registration.modules.engine = {
                    gridId: '#table_engines',
                    formId: '#form_engine',
                    dialogId: '#registration_engine',
                    photoFormId: '#form_engine_photo',
                    photoDialogId: '#registration_engine_photo',
                    webApiUrl: Settings.WebApiUrl + '/api/KendoEngines',
                };
                registration.retrieveEngines(); // kendo grid id
                registration.SubmitEngine(); // Create, Update
                registration.EnginePhotoSubmit();
            } catch (e) {
                console.log(e.message);
            }

            // initializing channel related
            try {
                registration.modules.channel = {
                    gridId: '#table_channels',
                    formId: '#form_channel',
                    dialogId: '#registration_channel',
                    webApiUrl: Settings.WebApiUrl + '/api/KendoChannels',
                };
                registration.retrieveChannels(); // kendo grid id
                registration.SubmitChannel(); // Create, Update
            } catch (e) {
                console.log(e.message);
            }

            registration.engine_type_OnChange();
        }, 100);

        // Not in use
        //registration.fetchMasterData();
    },

    fetchMasterData: function () {
        var url = "/api/DropDown/";

        // Populate dropdown with list of accounts
        for (var i = 0; i < registration.dropdownlist.length; i++) {
            var drop = $('#' + registration.dropdownlist[i].ctrl);
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/" + registration.dropdownlist[i].method;
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    registration.dropdownlist[i].list = [];
                    $.each(data, function (key, entry) {
                        registration.dropdownlist[i].list.push({
                            key: key,
                            value: entry
                        });
                    });
                }
            });
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

                    //data: Settings.ClientData,

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
                //data: Settings.ClientData,
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

                    //data: Settings.ClientData,

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
                field: "account.name",
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
            {
                field: "twoFactorEnabled",
                title: "Two Factor Enabled",
                filterable: false,
                template: function (dataItem) {
                    return dataItem.twoFactorEnabled?"Yes":"No";
                },
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
        /*
        
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
            async: false,
            //data: Settings.ClientData,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: function (data) {
                //Process data retrieved
                $.each(data, function (key, entry) {
                    dropdownParent.append($('<option></option>').attr('value', entry.id).text(entry.name));
                });
            }
        });
        */

        var url = "/api/DropDown/";
        var dropdownlist =
            [
                {
                    ctrl: 'userParent',
                    method: 'ListAllAccounts'
                },
                {
                    ctrl: 'userCountry',
                    method: 'ListAllCountry'
                },
                {
                    ctrl: 'userRole',
                    method: 'ListAllRoles'
                }
            ];

        // Populate dropdown with list of accounts
        for (var i = 0; i < dropdownlist.length; i++) {
            var drop = $('#' + dropdownlist[i].ctrl);
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/" + dropdownlist[i].method;
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    $.each(data, function (key, entry) {
                        drop.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });
                }
            });
        }
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
            var selectedRoles = $("#userRole").data("kendoMultiSelect").value();
            var roles = [];
            for (var i = 0; i < selectedRoles.length; i++) {
                roles.push({ id: selectedRoles[i] });
            }

            var data = {
                fullName: $('#userName').val(),
                accountID: $('#userParent').val(),
                jobTitle: $('#userTitle').val(),
                businessPhoneNumber: $('#userPhone').val(),
                phoneNumber: $('#userMobile').val(),
                email: $('#userEmail').val(),
                country: $('#userCountry').val(),
                twoFactorEnabled: ($('#userTwoFA').val().toLowerCase()==='yes'),
                userRoles: roles
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

        var multiselect = $("#userRole").data("kendoMultiSelect");
        multiselect.enable(false);

        registration.SubmitUserInitControls();
    },

    btnEditUser_OnClick: function () {
        var userGrid = registration.modules.user.grid;
        var selectedItem = userGrid.dataItem(userGrid.select());

        var userRoels = $("#userRole").data("kendoMultiSelect");
        //var userRoels = $("#userRole").kendoMultiSelect({
        //    itemTemplate: "#:data.text# <input type='checkbox'/>",
        //    autoClose: true,
        //    change: function () {
        //        var items = this.ul.find("li");
        //        items.each(function () {
        //            var element = $(this);
        //            var input = element.children("input");

        //            input.prop("checked", element.hasClass("k-state-selected"));
        //        });
        //    }
        //}).data("kendoMultiSelect");

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
            $('#userCountry').val(selectedItem.country);
            $('#userTwoFA').val(selectedItem.twoFactorEnabled?"Yes":"No");

            var multiselect = $("#userRole").data("kendoMultiSelect");
            multiselect.enable(true);

            // roles
            var roles = [];
            $.each(selectedItem.userRoles, function (i, r){
                if (r.id) {
                    roles.push(r.id);
                }
            });
            userRoels.value(roles);
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
                dataType: 'json',
                // passing token
                //data: Settings.ClientData,
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
                dataType: 'json',
                // passing token
                //data: Settings.ClientData,
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

                    //data: Settings.ClientData,

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
                field: "image",
                title: "Image",
                template: function (dataItem) {
                    var url = Settings.WebApiUrl + "/api/KendoVessels/GetPhoto?fileName=" + dataItem.id;
                    var str;
                    $.ajax({
                        url: url,
                        async: false,
                        success: function (imageData) {
                            str = "<img class='img-rounded' src='" + imageData + "' width='70' height='70'>";
                        }
                    });

                    return str;
                },
                width: 90,
                filterable: false,
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
                field: "ownerAccountName",
                title: "Owner",
                filterable: {
                    extra: false
                },
                width: 200,
                //template: function (dataItem) {
                //    return (dataItem.ownerAccount && dataItem.ownerAccount.name ? dataItem.ownerAccount.name : '');
                //}
            },
            {
                field: "operatorAccountName",
                title: "Operator",
                filterable: {
                    extra: false
                },
                width: 200,
                //template: function (dataItem) {
                //    return (dataItem.operatorAccount && dataItem.operatorAccount.name ? dataItem.operatorAccount.name : '');
                //}
            },
            {
                field: "shipTypeName",
                title: "Ship Type",
                width: 100,
                filterable: false,
                //template: function (dataItem) {
                //    return (dataItem.shipType && dataItem.shipType.name ? dataItem.shipType.name : '');
                //}
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
                    return (dataItem.buildYear ? new Date(dataItem.buildYear).getFullYear() : '');
                }
            },
            {
                field: "deliveryToOwner",
                title: "Delivery To Owner",
                filterable: false,
                width: 200,
                template: function (dataItem) {
                    return (dataItem.deliveryToOwner ? new Date(dataItem.deliveryToOwner).getFullYear() : '');
                }
            },
            {
                field: "shipClassName",
                title: "Ship Class",
                filterable: false,
                //template: function (dataItem) {
                //    return (dataItem.shipClass && dataItem.shipClass.name?dataItem.shipClass.name:'');
                //},
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

        Util.displayLoading(document.body, false); //hide loading
    },

    SubmitVesselInitControls: function () {
        // initailize dropdown

        var url = "/api/DropDown/";
        var dropdownlist =
            [
                {
                    ctrl: 'vessel_owner',
                    method: 'ListAllAccounts'
                },
                {
                    ctrl: 'vessel_operator',
                    method: 'ListAllAccounts'
                },
                {
                    ctrl: 'vessel_shipyardCountry',
                    method: 'ListAllCountry'
                },
                {
                    ctrl: 'vessel_shipType',
                    method: 'ListAllShipType'
                },
                {
                    ctrl: 'vessel_class',
                    method: 'ListAllShipClass'
                }
            ];

        // Populate dropdown with list of accounts
        for (var i = 0; i < dropdownlist.length; i++) {
            var drop = $('#' + dropdownlist[i].ctrl);
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/" + dropdownlist[i].method;
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    $.each(data, function (key, entry) {
                        drop.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });
                }
            });
        }

        // Setting date time picker to year

        $("#vessel_builtYear").datepicker({
            format: " yyyy", // Notice the Extra space at the beginning
            viewMode: "years",
            minViewMode: "years"
        }).on('show', function (e) {
            if ($(this).val().length > 0) {
                $(this).datepicker('update', new Date($(this).val()));
            }
        });

        $("#vessel_ownYear").datepicker({
            format: " yyyy", // Notice the Extra space at the beginning
            viewMode: "years",
            minViewMode: "years"
        }).on('show', function (e) {
            if ($(this).val().length > 0) {
                $(this).datepicker('update', new Date($(this).val()));
            }
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
                    buildYear: $('#vessel_builtYear').val() ? new Date($('#vessel_builtYear').val()).toLocaleDateString('en') : null,
                    deliveryToOwner: $('#vessel_ownYear').val() ? new Date($('#vessel_ownYear').val()).toLocaleDateString('en') : null,
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

                        $(registration.modules.vessel.dialogId).modal('hide');

                        $(registration.modules.vessel.gridId).data('kendoGrid').dataSource.read();
                        $(registration.modules.vessel.gridId).data('kendoGrid').refresh();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $('#errors').html('');
                        $('#errors').append(xhr.responseText);
                        $('#messageModal').modal('show');
                        $("#btnVesselSubmit").prop("disabled", false);
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

            var bYear = Date.parse(selectedItem.buildYear);
            if (bYear) $('#vessel_builtYear').val(new Date(bYear).getFullYear());

            var dYear = Date.parse(selectedItem.deliveryToOwner);
            if (dYear) $('#vessel_ownYear').val(new Date(dYear).getFullYear());

            //$('#vessel_builtYear').datepicker('update', selectedItem.buildYear);
            //$('#vessel_ownYear').datepicker('update', selectedItem.deliveryToOwner);

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
            var str = "Are you sure you want to delete \'" + selectedItem.vesselName + "\' vessel?";
            str += "\nAll incoming data and engines under this vessel will be deleted.";
            var ans = confirm(str);
            if (!ans) return;

            $.ajax({
                type: 'DELETE',
                url: url,
                contentType: "application/json",
                data: null,
                dataType: 'json',
                // passing token
                //data: Settings.ClientData,
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
                    $("#btnVesselSubmit").prop("disabled", false);
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
                var fileName = selectedItem.id; // + e.files[0].extension.toLowerCase();
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
                    if (this.extension.toLowerCase() != ".jpg"
                        && this.extension.toLowerCase() != ".jpeg"
                        && this.extension.toLowerCase() != ".png") {
                        alert("Only .jpg or .png files can be uploaded");
                        e.preventDefault();
                    }
                });
            },
            error: function onError(e) { },
            success: function onSuccess() {
                $(registration.modules.vessel.photoDialogId).modal('hide');
                registration.retrieveVessels();
            }
        });
    },

    btnAddShipType_OnClick: function () {
        $('#masterdata_header').html("Ship Type");
        $('#master_url').val('/api/KendoShipTypes');
        $('#master_targetDropDown').val('vessel_shipType');
    },

    btnAddShipClass_OnClick: function () {
        $('#masterdata_header').html("Ship Class");
        $('#master_url').val('/api/KendoShipClasses');
        $('#master_targetDropDown').val('vessel_class');
    },

    /* ----------------------------------------------------------------- Engine -----------------------------------------------------------------*/

    retrieveEngines: function () {
        var pageNumber = 1;
        var url = registration.modules.engine.webApiUrl;

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

                    //data: Settings.ClientData,

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
            schema: {
                // describe the result format
                data: "data", // records are returned in the "data" field of the response
                total: "total" // total number of records is in the "total" field of the response
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: { field: "serialNo", dir: "asc" }
        });

        // column settings
        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "image",
                title: "Image",
                template: function (dataItem) {
                    var url = Settings.WebApiUrl + "/api/KendoEngines/GetPhoto?fileName=" + dataItem.id;
                    var str;
                    $.ajax({
                        url: url,
                        async: false,
                        success: function (imageData) {
                            str = "<img class='img-rounded' src='" + imageData + "' width='70' height='70'>";
                        }
                    });

                    return str;
                },
                width: 90,
                filterable: false,
            },
            {
                field: "serialNo",
                title: "Serial No.",
                filterable: {
                    extra: false
                },
                width: 200
            },
            {
                field: "vessel.vesselName",
                title: "Vessel",
                filterable: {
                    extra: false
                },
                template: function (dataItem) {
                    return (dataItem.vessel && dataItem.vessel.vesselName ? dataItem.vessel.vesselName : '');
                },
                width: 200
            },
            {
                field: "engineType.name",
                title: "Engine Type",
                filterable: {
                    extra: false
                },
                width: 100,
                template: function (dataItem) {
                    return (dataItem.engineType && dataItem.engineType.name ? dataItem.engineType.name : '');
                }
            },
            {
                field: "model.name",
                title: "Model",
                filterable: {
                    extra: false
                },
                width: 100,
                template: function (dataItem) {
                    return (dataItem.model && dataItem.model.name ? dataItem.model.name : '');
                }
            },
            {
                field: "outputPower",
                title: "Output Power",
                width: 100,
                filterable: false,
            },
            {
                field: "rpm",
                title: "RPM",
                width: 100,
                filterable: false,
            },
            {
                field: "gearBoxModel",
                title: "Gearbox Model",
                width: 150,
                filterable: false,
                template: function (dataItem) {
                    return (dataItem.gearboxModel && dataItem.gearboxModel.name ? dataItem.gearboxModel.name : '');
                }
            },
            {
                field: "gearRatio",
                title: "Gear Ratio",
                filterable: false,
                width: 100,
            },
            {
                field: "alternatorMaker.name",
                title: "Alternator Maker",
                filterable: false,
                width: 200,
                template: function (dataItem) {
                    return (dataItem.alternatorMaker && dataItem.alternatorMaker.name ? dataItem.alternatorMaker.name : '');
                }
            },
            {
                field: "alternatorMakerModel",
                title: "Alternator Maker Model",
                filterable: false,
                width: 100,
            },
            {
                field: "alternatorSrNo",
                title: "Alternator Sr. No.",
                filterable: false,
                width: 100,
            },
            {
                field: "alternatorOutput",
                title: "Alternator Output",
                filterable: false,
                width: 100,
            },
            {
                field: "powerSupplySystem",
                title: "PowerSupplySystem",
                filterable: false,
                width: 100,
            },
            {
                field: "insulationTempRise",
                title: "InsulationTempRise",
                filterable: false,
                width: 100,
            },
            {
                field: "ipRating",
                title: "IP Rating",
                filterable: false,
                width: 100,
            },
            {
                field: "mounting",
                title: "Mounting",
                filterable: false,
                width: 100,
            },
            {
                field: "alertEmail",
                title: "Alert Email",
                filterable: false,
                width: 100,
                template: function (dataItem) {
                    var display;
                    switch (dataItem.dataTypeNo) {
                        case 0: display = "None"; break;
                        case 1: display = "Owner"; break;
                        case 2: display = "Operator"; break;
                        case 3: display = "Both"; break;
                        default: display = "";
                    }
                    return display;
                }
            },
        ];

        // initialize grid
        $(registration.modules.engine.gridId).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            scrollable: true,
            resizable: true,
            pageable: true,
            selectable: "row",
            change: registration.engineGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(registration.modules.engine.gridId).data("kendoGrid");
        registration.modules.engine.grid = grid;

        $('#btnEditEngine').prop('disabled', true);
        $('#btnDelEngine').prop('disabled', true);
        $('#btnUploadEnginePhoto').prop('disabled', true);
    },

    SubmitEngineInitControls: function () {
        // initailize dropdown
        var url = "/api/DropDown/";
        var dropdownlist =
            [
                {
                    ctrl: 'engine_vessel',
                    method: 'ListAllVessels'
                },
                {
                    ctrl: 'engine_type',
                    method: 'ListAllEngineTypes'
                },
                {
                    ctrl: 'engine_gearboxModel',
                    method: 'ListAllGearboxModels'
                },
                {
                    ctrl: 'engine_alternatorMaker',
                    method: 'ListAllAlternatorMakers'
                },
                {
                    ctrl: 'engine_alertEmail',
                    method: 'ListAllOptionSetByName?groupname=AlertEmails'
                },
                {
                    ctrl: 'engine_side',
                    method: 'ListAllOptionSetByName?groupname=Side'
                }
            ];

        // Populate dropdown with list of accounts
        for (var i = 0; i < dropdownlist.length ; i++) {
            var drop = $('#' + dropdownlist[i].ctrl);
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/" + dropdownlist[i].method;
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    $.each(data, function (key, entry) {
                            drop.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });
                }
            });
        }
        $('#engine_type').trigger('change');
    },

    SubmitEngine: function () {

        registration.SubmitEngineInitControls();

        $('#engine_type').trigger('change');

        // validation
        $(registration.modules.engine.formId).bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                engine_vessel: {
                    validators: {
                        notEmpty: {
                            message: 'Vessel is required'
                        }
                    }
                },
                engine_type: {
                    validators: {
                        notEmpty: {
                            message: 'Engine type required'
                        }
                    }
                },
                engine_model: {
                    validators: {
                        notEmpty: {
                            message: 'Engine model is required'
                        },
                    }
                },
                engine_sno: {
                    validators: {
                        notEmpty: {
                            message: 'Engine serial number is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'Serial number must be less than 100 characters long'
                        },
                    }
                },
                engine_outputPower: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                engine_rpm: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                engine_gearboxModel: {},
                engine_gearboxSrNo: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Gear box serial number must be less than 100 characters long'
                        }
                    }
                },
                engine_gearboxRatio: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Gear box ratio must be less than 100 characters long'
                        }
                    }
                },
                engine_alternatorMaker: {},
                engine_alternatorMakerModel: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Alternator maker model must be less than 100 characters long'
                        }
                    }
                },
                engine_alternatorSrNo: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Alternator serial number must be less than 100 characters long'
                        }
                    }
                },
                engine_alternatorOutput: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                engine_powerSupplySystem: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Power supply system must be less than 100 characters long'
                        }
                    }
                }, 
                engine_insulation: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                }, 
                engine_iprRate: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'IPR rating must be less than 100 characters long'
                        }
                    }
                }, 
                engine_mounting: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Mounting must be less than 100 characters long'
                        }
                    }
                },
                engine_side: {
                    validators: {
                        notEmpty: {
                            message: 'Side is required'
                        }
                    }
                }
            }
        })
        .on('success.form.bv', function (e) {
            // Prevent form submission
            e.preventDefault();
            var url = registration.modules.engine.webApiUrl;
            var data = {
                vesselID: $('#engine_vessel').val(),
                engineTypeID: $('#engine_type').val(),
                engineModelID: $('#engine_model').val(),
                serialNo: $('#engine_sno').val(),
                outputPower: $('#engine_outputPower').val(),
                rpm: $('#engine_rpm').val(),
                gearBoxModelID: $('#engine_gearboxModel').val(),
                gearBoxSerialNo: $('#engine_gearboxSrNo').val(),
                gearRatio: $('#engine_gearboxRatio').val(),
                powerSupplySystem: $('#engine_powerSupplySystem').val(),
                insulationTempRise: $('#engine_insulation').val(),
                ipRating: $('#engine_iprRate').val(),
                mounting: $('#engine_mounting').val(),
                alertEmail: $('#engine_alertEmail').val(),
                side: $('#engine_side').val()
            };

            if ($('#engine_type option:selected').text() != 'Engine') {
                data.alternatorMakerID = $('#engine_alternatorMaker').val();
                data.alternatorMakerModel = $('#engine_alternatorMakerModel').val();
                data.alternatorSrNo = $('#engine_alternatorSrNo').val();
                data.alternatorOutput = $('#engine_alternatorOutput').val();
            }
            else {
                data.alternatorMakerID = null;
                data.alternatorMakerModel = null;
                data.alternatorSrNo = null;
                data.alternatorOutput = null;
            }

            var requestType = "POST"; // Create

            if (registration.modules.engine.state === 'update') {
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

                    $(registration.modules.engine.dialogId).modal('hide');

                    $(registration.modules.engine.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.engine.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#btnEngineSubmit").prop("disabled", false);
                }
            });
        });
    },

    engineGrid_OnChange: function (arg) {
        var row = this.select();
        if (row) {
            $('#btnEditEngine').prop('disabled', false);
            $('#btnDelEngine').prop('disabled', false);
            $('#btnUploadEnginePhoto').prop('disabled', false);
        }
    },

    btnNewEngine_OnClick: function () {
        registration.modules.engine.state = 'create';
        registration.SubmitEngineInitControls();
    },

    btnEditEngine_OnClick: function () {
        var engineGrid = registration.modules.engine.grid;
        var selectedItem = engineGrid.dataItem(engineGrid.select());

        if (selectedItem) {
            registration.modules.engine.state = 'update';
            registration.SubmitEngineInitControls();

            $('#id').val(selectedItem.id);
            $('#engine_vessel').val(selectedItem.vesselID);
            $('#engine_type').val(selectedItem.engineTypeID);
            $('#engine_model').val(selectedItem.engineModelID);
            $('#engine_sno').val(selectedItem.serialNo);
            $('#engine_outputPower').val(selectedItem.outputPower);
            $('#engine_rpm').val(selectedItem.rpm);
            $('#engine_gearboxModel').val(selectedItem.gearBoxModelID);
            $('#engine_gearboxSrNo').val(selectedItem.gearBoxSerialNo);
            $('#engine_gearboxRatio').val(selectedItem.gearRatio);
            $('#engine_alternatorMaker').val(selectedItem.alternatorMakerID);
            $('#engine_alternatorMakerModel').val(selectedItem.alternatorMakerModel);
            $('#engine_alternatorSrNo').val(selectedItem.alternatorSrNo);
            $('#engine_alternatorOutput').val(selectedItem.alternatorOutput);
            $('#engine_powerSupplySystem').val(selectedItem.powerSupplySystem);
            $('#engine_insulation').val(selectedItem.insulationTempRise);
            $('#engine_iprRate').val(selectedItem.ipRating);
            $('#engine_mounting').val(selectedItem.mounting);
            $('#engine_alertEmail').val(selectedItem.alertEmail);
            $('#engine_side').val(selectedItem.side);
        }
        else {
            $(registration.modules.engine.dialogId).modal('hide');
        }
    },

    btnDelEngine_OnClick: function () {
        var engineGrid = registration.modules.engine.grid;
        var selectedItem = engineGrid.dataItem(engineGrid.select());
        var url = registration.modules.engine.webApiUrl + '/' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("Are you sure you want to delete \'Engine (" + selectedItem.serialNo + ")\'?");
            if (!ans) return;

            $.ajax({
                type: 'DELETE',
                url: url,
                contentType: "application/json",
                data: null,
                dataType: 'json',
                // passing token
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(registration.modules.engine.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.engine.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#btnEngineSubmit").prop("disabled", false);
                }
            });
        }
        else {
            $(registration.modules.engine.dialogId).modal('hide');
        }
    },

    EnginePhotoSubmit: function () {
        $("#enginePhoto").kendoUpload({
            async: {
                // will apend file name before uploading (upload event)
                saveUrl: registration.modules.engine.webApiUrl + '/UploadPhoto',
                autoUpload: false,
            },
            multiple: false,
            upload: function onUpload(e) {
                if (e.files.length != 1) {
                    alert("No file to upload");
                    e.preventDefault();
                }

                // Setting file name on server
                var engineGrid = registration.modules.engine.grid;
                var selectedItem = engineGrid.dataItem(engineGrid.select());
                var fileName = selectedItem.id; // + e.files[0].extension.toLowerCase();
                e.sender.options.async.saveUrl = registration.modules.engine.webApiUrl + '/UploadPhoto?fileName=' + fileName;

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
                    if (this.extension.toLowerCase() != ".jpg"
                        && this.extension.toLowerCase() != ".jpeg"
                        && this.extension.toLowerCase() != ".png") {
                        alert("Only .jpg or .png files can be uploaded");
                        e.preventDefault();
                    }
                });
            },
            error: function onError(e) { },
            success: function onSuccess() {
                $(registration.modules.engine.photoDialogId).modal('hide');
                registration.retrieveEngines();
            }
        });
    },

    engine_type_OnChange: function () {
        $('#engine_type').change(function () {
            var selectedEngineType = $('#engine_type').val();
            var drop = $('#engine_model')
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/ListAllModels";
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    $.each(data, function (key, entry) {
                        if (entry.engineTypeID == selectedEngineType) drop.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });
                }
            });

            var selectedEngineTypeName = $('#engine_type option:selected').text();
            if (selectedEngineTypeName === 'Engine') {
                $('#engine_alternatorMaker_group').hide();
                $('#engine_alternatorMakerModel_group').hide();
                $('#engine_alternatorSrNo_group').hide();
                $('#engine_alternatorOutput_group').hide();
            }
            else {
                $('#engine_alternatorMaker_group').show();
                $('#engine_alternatorMakerModel_group').show();
                $('#engine_alternatorSrNo_group').show();
                $('#engine_alternatorOutput_group').show();
            }
        });
    },

    btnAddEngineModel_OnClick: function () {
        $('#masterdata_header').html("Engine Model");
        $('#master_url').val('/api/KendoModels');
        $('#master_targetDropDown').val('engine_model');
    },

    btnAddGearboxModel_OnClick: function () {
        $('#masterdata_header').html("Gearbox Model");
        $('#master_url').val('/api/KendoGearboxModels');
        $('#master_targetDropDown').val('engine_gearboxModel');
    },

    btnAddAlternatorMaker_OnClick: function () {
        $('#masterdata_header').html("Alternator Maker");
        $('#master_url').val('/api/KendoAlternatorMakers');
        $('#master_targetDropDown').val('engine_alternatorMaker');
    },

    /* ----------------------------------------------------------------- Channel -----------------------------------------------------------------*/

    retrieveChannels: function () {
        var pageNumber = 1;
        var url = registration.modules.channel.webApiUrl;

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

                    //data: Settings.ClientData,
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
            schema: {
                // describe the result format
                data: "data", // records are returned in the "data" field of the response
                total: "total" // total number of records is in the "total" field of the response
            },
            pageSize: 10,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: [
                { field: "model.name", dir: "asc" },
                { field: "channelNo", dir: "asc" }
            ],
            change: function (e) {
                Util.displayLoading(document.body, false);
            }
        });

        // column settings
        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "model.name",
                title: "Model",
                filterable: {
                    extra: false
                },
                width: 150,
                template: function (dataItem) {
                    return (dataItem.model && dataItem.model.name ? dataItem.model.name : '');
                }
            },
            {
                field: "channelNo",
                title: "Channel No",
                width: 150,
                filterable: {
                    extra: false
                },
            },
            {
                field: "name",
                title: "Channel Name",
                filterable: {
                    extra: false
                },
                width: 250
            },
            {
                field: "minRange",
                title: "Min Range",
                width: 100,
                filterable: false,
            },
            {
                field: "maxRange",
                title: "Max Range",
                width: 100,
                filterable: false,
            },
            {
                field: "scale",
                title: "Scale",
                filterable: false,
                width: 100,
            },
            {
                field: "displayUnit",
                title: "Display Unit",
                filterable: false,
                width: 100,
            },
            {
                field: "lowerLimit",
                title: "Lower Limit",
                filterable: false,
                width: 100,
            },
            {
                field: "upperLimit",
                title: "Upper Limit",
                filterable: false,
                width: 100,
            },
            {
                field: "monitoringTimer",
                title: "Monitoring Timer",
                filterable: false,
                width: 100,
            },
            {
                field: "dataTypeNo",
                title: "Data Type",
                filterable: false,
                width: 100,
                template: function (dataItem) {
                    var display;
                    switch (dataItem.dataTypeNo) {
                        case 1: display = "Digital"; break;
                        case 2: display = "Analog"; break;
                        case 3: display = "Text"; break;
                        default: display = "";
                    }
                    return display;
                }
            },
            {
                field: "documentURL",
                title: "Document URL",
                filterable: false,
                width: 150,
                template: function (dataItem) {
                    if (dataItem && dataItem.documentURL) {
                        return "<a href='" + kendo.htmlEncode(dataItem.documentURL) + "' target='_blank'>Open document...</a>";
                    }
                    else {
                        return '';
                    } 
                }
            },
        ];

        // initialize grid
        $(registration.modules.channel.gridId).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            scrollable: true,
            resizable: true,
            pageable: true,
            selectable: "row",
            change: registration.channelGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(registration.modules.channel.gridId).data("kendoGrid");
        registration.modules.channel.grid = grid;

        $('#btnEditChannel').prop('disabled', true);
        $('#btnDelChannel').prop('disabled', true);
    },

    SubmitChannelInitControls: function () {
        // initailize dropdown
        var url = "/api/DropDown/";
        var dropdownlist =
            [
                {
                    ctrl: 'channel_model',
                    method: 'ListAllModels'
                },
                {
                    ctrl: 'channel_chartType',
                    method: 'ListAllChartTypes'
                },
                {
                    ctrl: 'channel_dataType',
                    method: 'ListAllOptionSetByName?groupname=DataType'
                },
                {
                    ctrl: 'channel_side',
                    method: 'ListAllOptionSetByName?groupname=Side'
                },
            ];

        // Populate dropdown with list of accounts
        for (var i = 0; i < dropdownlist.length; i++) {
            var drop = $('#' + dropdownlist[i].ctrl);
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/" + dropdownlist[i].method;
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    $.each(data, function (key, entry) {
                        drop.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });
                }
            });
        }

        $('#channel_alarmValue')
            .empty()
            .append('<option value="0">0</option>')
            .append('<option value="1">1</option>');

        $('#channel_dataType').change(function () {
            var d = this.value;
            if (d == "1") $('#channel_alarmValue').prop('disabled', false);
            else $('#channel_alarmValue').prop('disabled', 'disabled');
        })
    },

    SubmitChannel: function () {

        registration.SubmitChannelInitControls();

        // validation
        $(registration.modules.channel.formId).bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                channel_model: {
                    validators: {
                        notEmpty: {
                            message: 'Engine model is required'
                        }
                    }
                },
                channel_channelNo: {
                    validators: {
                        notEmpty: {
                            message: 'Channel number is required'
                        }
                    }
                },
                channel_channelName: {
                    validators: {
                        notEmpty: {
                            message: 'Channel name is required'
                        },
                    }
                },
                channel_dashboardDisplay: {},
                channel_chartType: {
                    validators: {}
                },
                channel_minRange: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Gear box model name must be less than 100 characters long'
                        }
                    }
                },
                channel_maxRange: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                channel_scale: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                channel_unit: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'Gear box model name must be less than 100 characters long'
                        }
                    }
                },
                channel_lowerLimit: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                channel_upperLimit: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                channel_monitor: {
                    integer: {
                        message: 'The value is not an integer'
                    }
                },
                channel_dataType: {
                    validators: {
                        notEmpty: {
                            message: 'Channel type is required'
                        }
                    }
                },
                channel_side: {
                    validators: {
                        notEmpty: {
                            message: 'Side is required'
                        }
                    }
                },
            }
        })
            .on('success.form.bv', function (e) {
                // Prevent form submission
                e.preventDefault();
                var url = registration.modules.channel.webApiUrl;
                var data = {
                    channelNo: $('#channel_channelNo').val(),
                    name: $('#channel_channelName').val(),
                    modelID: $('#channel_model').val(),
                    dashboardDisplay: ($('#channel_dashboardDisplay').prop('checked')?1:0),
                    chartTypeID: $('#channel_chartType').val(),
                    minRange: $('#channel_minRange').val(),
                    maxRange: $('#channel_maxRange').val(),
                    scale: $('#channel_scale').val(),
                    displayUnit: $('#channel_unit').val(),
                    lowerLimit: $('#channel_lowerLimit').val(),
                    upperLimit: $('#channel_upperLimit').val(),
                    monitoringTimer: $('#channel_monitor').val(),
                    dataTypeNo: $('#channel_dataType').val(),
                    alarmValue: $('#channel_alarmValue').val(),
                    documentURL: $('#channel_documentUrl').val(),
                    side: $('#channel_side').val(),
                };
                var requestType = "POST"; // Create

                if (registration.modules.channel.state === 'update') {
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

                        $(registration.modules.channel.dialogId).modal('hide');

                        $(registration.modules.channel.gridId).data('kendoGrid').dataSource.read();
                        $(registration.modules.channel.gridId).data('kendoGrid').refresh();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $('#errors').html('');
                        $('#errors').append(xhr.responseText);
                        $('#messageModal').modal('show');
                        $("#btnChannelSubmit").prop("disabled", false);
                    }
                });
            });
    },

    channelGrid_OnChange: function (arg) {
        var row = this.select();
        if (row) {
            $('#btnEditChannel').prop('disabled', false);
            $('#btnDelChannel').prop('disabled', false);
        }
    },

    btnNewChannel_OnClick: function () {
        registration.modules.channel.state = 'create';
        registration.SubmitChannelInitControls();
    },

    btnEditChannel_OnClick: function () {
        var channelGrid = registration.modules.channel.grid;
        var selectedItem = channelGrid.dataItem(channelGrid.select());

        if (selectedItem) {
            registration.modules.channel.state = 'update';
            registration.SubmitChannelInitControls();

            $('#id').val(selectedItem.id);
            $('#channel_model').val(selectedItem.modelID);
            $('#channel_channelNo').val(selectedItem.channelNo);
            $('#channel_channelName').val(selectedItem.name);
            var isChecked = (selectedItem.dashboardDisplay == null ? 0 : selectedItem.dashboardDisplay);
            $('#channel_dashboardDisplay').prop('checked', isChecked);
            $('#channel_chartType').val(selectedItem.chartTypeID);
            $('#channel_minRange').val(selectedItem.minRange);
            $('#channel_maxRange').val(selectedItem.maxRange);
            $('#channel_scale').val(selectedItem.scale);
            $('#channel_unit').val(selectedItem.displayUnit);
            $('#channel_lowerLimit').val(selectedItem.lowerLimit);
            $('#channel_upperLimit').val(selectedItem.upperLimit);
            $('#channel_monitor').val(selectedItem.monitoringTimer);
            $('#channel_dataType').val(selectedItem.dataTypeNo);
            $('#channel_alarmValue').val(selectedItem.alarmValue);
            $('#channel_documentUrl').val(selectedItem.documentURL);
            $('#channel_side').val(selectedItem.side);
        }
        else {
            $(registration.modules.channel.dialogId).modal('hide');
        }
    },

    btnDelChannel_OnClick: function () {
        var channelGrid = registration.modules.channel.grid;
        var selectedItem = channelGrid.dataItem(channelGrid.select());
        var url = registration.modules.channel.webApiUrl + '/' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("Are you sure you want to delete \'Channel (" + selectedItem.name + ")\'?");
            if (!ans) return;

            $.ajax({
                type: 'DELETE',
                url: url,
                contentType: "application/json",
                dataType: 'json',
                // passing token
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    console.log(d);

                    $(registration.modules.channel.gridId).data('kendoGrid').dataSource.read();
                    $(registration.modules.channel.gridId).data('kendoGrid').refresh();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                    $("#btnChannelSubmit").prop("disabled", false);
                }
            });
        }
        else {
            $(registration.modules.channel.dialogId).modal('hide');
        }
    },

    /* ----------------------------------------------------------------- Master Data -----------------------------------------------------------------*/

    btnSaveMaster_OnClick: function () {
        var requestType = 'POST';
        var url = $('#master_url').val();
        var master_name = $('#master_name').val();
        var dropdown = $('#master_targetDropDown').val();
        var data = {
            name: master_name
        };

        // Only for engine model master data adding
        if (url.endsWith('KendoModels')) {
            var engine_type = $('#engine_type').val();
            if (engine_type) data.engineTypeID = engine_type;
        }

        $.ajax({
            type: requestType,
            url: Settings.WebApiUrl + url,
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: 'json',
            // passing token
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: function (d, textStatus, xhr) {
                console.log(d);
                $('#' + dropdown).append($('<option/>', {
                    value: d.id,
                    text: d.name,
                    selected: 'selected',
                }));

                $('#master_name').val('');
                $("#inputModal").modal('hide');
            },
            error: function (xhr, textStatus, errorThrown) {
                $('#errors').html('');
                $('#errors').append('Error creating master data.');
                $('#messageModal').modal('show');
            }
        });
    },
};