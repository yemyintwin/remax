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

var alertSettings = {
    modules: {
        settings: null
    },

    onload: function () {
        if (!token) {
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
            alertSettings.modules.settings = {
                gridId: '#table_alert_setting',
                formId: '#form_alertSetting',
                dialogId: '#registration_alert_setting',
                webApiUrl: Settings.WebApiUrl + '/api/KendoAlertSettings',
            };

            alertSettings.retrieveSettings(); // kendo grid id
            alertSettings.SubmitSetting(); // Create, Update
            $("#engineModel").change(alertSettings.engineModel_OnChange); // engine model drop down event listener

            Util.displayLoading(document.body, false); //show loading and hide when all channels are loaded
        }, 100);
    },

    engineModel_OnChange: function () {
        Util.displayLoading(document.body, true);
        setTimeout(function () {
            var model = $("#engineModel");
            var url = Settings.WebApiUrl + "/api/DropDown/ListAllChannelByEngineModelId?engineModelid=" + model.val();
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
                    $('#channelNo').find('option').remove().end();

                    $.each(data, function (key, entry) {
                        $('#channelNo').append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });

                    var grid = alertSettings.modules.settings.grid;
                    var selectedItem = grid.dataItem(grid.select());
                    if (selectedItem && selectedItem.channelID) {
                        $('#channelNo').val(selectedItem.channelID);
                    }
                }
            });
        });
        Util.displayLoading(document.body, false);
    },

    retrieveSettings: function () {
        var pageNumber = 1;
        var url = alertSettings.modules.settings.webApiUrl;

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
            serverSorting: true
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
                field: "channel.name",
                title: "Channel",
                filterable: {
                    extra: false
                },
                width: 150,
                template: function (dataItem) {
                    return (dataItem.channel && dataItem.channel.name ? dataItem.channel.name : '');
                }
            },
            {
                field: "condition",
                title: "Condition",
                filterable: false,
                template: function (dataItem) {
                    var display;
                    switch (dataItem.condition) {
                        case 1: display = "Equal to"; break;
                        case 2: display = "Not equal to"; break;
                        case 3: display = "Greater than"; break;
                        case 4: display = "Less than"; break;
                        case 5: display = "Greater than or equal to"; break;
                        case 6: display = "Less than or equal to"; break;
                        default: display = "";
                    }
                    return display;
                }
            },
            {
                field: "value",
                title: "Value",
                filterable: false
            },
            {
                field: "alertLevel",
                title: "Alert Level",
                filterable: false,
                template: function (dataItem) {
                    var display;
                    switch (dataItem.alertLevel) {
                        case 1: display = "Information"; break;
                        case 2: display = "Warning"; break;
                        case 3: display = "Critical"; break;
                        default: display = "";
                    }
                    return display;
                }
            },
            {
                field: "message",
                title: "Message",
                filterable: false
            },
        ];

        // initialize grid
        $("#table_alert_setting").kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true,
            selectable: "row",
            change: alertSettings.settingGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(alertSettings.modules.settings.gridId).data("kendoGrid");
        alertSettings.modules.settings.grid = grid;

        $('#btnEditSetting').prop('disabled', true);
        $('#btnDelSetting').prop('disabled', true);
    },

    SubmitSettingInitControls: function () {
        var url = "/api/DropDown/";
        var dropdownlist =
            [
                {
                    ctrl: 'engineModel',
                    method: 'ListAllModels'
                },
                {
                    ctrl: 'condition',
                    method: 'ListAllOptionSetByName?groupname=Condition'
                },
                {
                    ctrl: 'level',
                    method: 'ListAllOptionSetByName?groupname=AlertLevel'
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
    },

    SubmitSetting: function () {
        alertSettings.SubmitSettingInitControls();

        // validation
        $(alertSettings.modules.settings.formId)
            .find('[name="channelNo"]')
            .selectpicker()
            .change(function (e) {
                // revalidate the language when it is changed
                $(alertSettings.modules.settings.formId).bootstrapValidator('revalidateField', 'channelNo');
            })
            .end()
            .bootstrapValidator({
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                excluded: ':disabled',
                fields: {
                    engineModel: {
                        validators: {
                            notEmpty: {
                                message: 'Engine model is requried'
                            },
                        }
                    },
                    channelNo: {
                        validators: {
                            notEmpty: {
                                message: 'Channel no. is required'
                            },
                        }
                    },
                    condition: {
                        validators: {
                            notEmpty: {
                                message: 'Condition is required'
                            },
                        }
                    },
                    value: {
                        validators: {
                            notEmpty: {
                                message: 'Value is required'
                            },
                        }
                    },
                    level: {
                        validators: {
                            notEmpty: {
                                message: 'Alert level is required'
                            },
                        }
                    },
                }
            })
            .on('success.form.bv', function (e) {
                // Prevent form submission
                e.preventDefault();
                var url = alertSettings.modules.settings.webApiUrl;
                var data = {
                    engineModelID: $('#engineModel').val(),
                    channelID: $('#channelNo').val(),
                    condition: $('#condition').val(),
                    value: $('#value').val(),
                    alertLevel: $('#level').val(),
                };
                var requestType = "POST"; // Create

                if (alertSettings.modules.settings.state === 'update') {
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

                        $(alertSettings.modules.settings.dialogId).modal('toggle');

                        $(alertSettings.modules.settings.gridId).data('kendoGrid').dataSource.read();
                        $(alertSettings.modules.settings.gridId).data('kendoGrid').refresh();
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

    settingGrid_OnChange: function (arg) {
        var row = this.select();
        if (row) {
            $('#btnEditSetting').prop('disabled', false);
            $('#btnDelSetting').prop('disabled', false);
        }
    },

    btnNewSetting_OnClick: function () {
        alertSettings.modules.settings.state = 'create';
        alertSettings.SubmitSettingInitControls();
        $('#engineModel').prop("disabled", false);
        $('#channelNo').prop("disabled", false);
        $('#value').val('');
        $("#engineModel").change();
    },

    btnEditSetting_OnClick: function () {
        var grid = alertSettings.modules.settings.grid;
        var selectedItem = grid.dataItem(grid.select());

        if (selectedItem) {
            alertSettings.modules.settings.state = 'update';
            alertSettings.SubmitSettingInitControls();

            $('#engineModel').prop("disabled", true);
            $('#channelNo').prop("disabled", true);

            $('#id').val(selectedItem.id);
            $('#engineModel').val(selectedItem.engineModelID); $("#engineModel").change();
            $('#channelNo').val(selectedItem.channelID);
            $('#condition').val(selectedItem.condition);
            $('#value').val(selectedItem.value);
            $('#level').val(selectedItem.alertLevel);
        }
        else {
            $(alertSettings.modules.settings.dialogId).modal('hide');
        }
    },

    btnDelSetting_OnClick: function () {
        var grid = alertSettings.modules.settings.grid;
        var selectedItem = grid.dataItem(grid.select());
        var url = alertSettings.modules.settings.webApiUrl + '/' + selectedItem.id;

        if (selectedItem) {
            var ans = confirm("Are you sure you want to delete selected alert setting?");
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

                    $(alertSettings.modules.settings.gridId).data('kendoGrid').dataSource.read();
                    $(alertSettings.modules.settings.gridId).data('kendoGrid').refresh();
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
            $(alertSettings.modules.settings.dialogId).modal('hide');
        }
    },
}