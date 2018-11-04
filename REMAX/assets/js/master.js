var token;

var master = {

    onload: function () {
        if (!token) {
            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
        }

        master.configure_altMakerGird();
        master.configure_modelGird();
        master.configure_gearboxModelGird();
        master.configure_shipClassesGird();
        master.configure_shipTypesGird();
    },

    configure_altMakerGird: function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoInlineAlternatorMaker",
                    type: "get",
                    dataType: "json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                update: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineAlternatorMaker/" + data.id;
                    },
                    type: "put",
                    dataType: "json",
                    //data: Settings.ClientData,
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                destroy: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineAlternatorMaker/" + data.id;
                    },
                    type: "delete",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_altMakers").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                create: {
                    url: Settings.WebApiUrl + "/api/KendoInlineAlternatorMaker",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_altMakers").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                parameterMap: function (options, operation) {
                    if (operation === "read") {
                        return {
                            aggregate: options.aggregate,
                            group: options.group,
                            filter: options.filter,
                            models: options.models,
                            page: options.page,
                            pageSize: options.pageSize,
                            take: options.take,
                            skip: options.skip,
                            sort: options.sort
                        }
                    }
                    else if (operation === "create" && options) {
                        return kendo.stringify({ name: options.name });
                    }
                    else if (operation === "update" && options) {
                        return kendo.stringify({ id:options.id, name: options.name });
                    }
                }
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            schema: {
                total: function (response) {
                    var total = response.length;
                    $.ajax({
                        type: 'get',
                        url: Settings.WebApiUrl + '/api/KendoInlineAlternatorMakerTotal',
                        contentType: "application/json",
                        dataType: 'json',
                        async: false,
                        // passing token
                        //data: Settings.ClientData,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'bearer ' + token);
                        },
                        success: function (d, textStatus, xhr) {
                            total = d;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(errorThrown);
                        }
                    });

                    return total;
                },
                model: {
                    id: "id",
                    fields: {
                        id: { editable: false, nullable: true },
                        name: { validation: { required: true } }
                    }
                }
            }
        });

        $("#table_altMakers").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            toolbar: ["create"],
            columns: [
                { field: "name", title: "Alternator Maker Name", width: "120px" },
                { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
            ],
            editable: "inline"
        });
    },

    getEngineType: function (engineTypeID) {
        if (engineTypeID == null) return "";
        else if (engineTypeID.toLowerCase() == "91E4BC9C-8844-E811-80C4-BC305B849686".toLowerCase()) return "Engine";
        else if (engineTypeID.toLowerCase() == "92E4BC9C-8844-E811-80C4-BC305B849686".toLowerCase()) return "Generator";
    },

    configure_modelGird: function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoInlineModel",
                    type: "get",
                    dataType: "json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                update: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineModel/" + data.id;
                    },
                    type: "put",
                    dataType: "json",
                    //data: Settings.ClientData,
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                destroy: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineModel/" + data.id;
                    },
                    type: "delete",
                    dataType: "json",
                    //data: Settings.ClientData,
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_Models").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                create: {
                    url: Settings.WebApiUrl + "/api/KendoInlineModel",
                    type: "post",
                    dataType: "json",
                    //data: Settings.ClientData,
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_Models").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                parameterMap: function (options, operation) {
                    if (operation === "read") {
                        return {
                            aggregate: options.aggregate,
                            group: options.group,
                            filter: options.filter,
                            models: options.models,
                            page: options.page,
                            pageSize: options.pageSize,
                            take: options.take,
                            skip: options.skip,
                            sort: options.sort
                        }
                    }
                    else if (operation === "create" && options) {
                        return kendo.stringify({ name: options.name, engineTypeId: options.engineTypeID });
                    }
                    else if (operation === "update" && options) {
                        return kendo.stringify({ id: options.id, name: options.name, engineTypeID: options.engineTypeID });
                    }
                }
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: { field: "name", dir: "asc" },
            schema: {
                total: function (response) {
                    var total = response.length;
                    $.ajax({
                        type: 'get',
                        url: Settings.WebApiUrl + '/api/KendoInlineModelTotal',
                        contentType: "application/json",
                        dataType: 'json',
                        async: false,
                        // passing token
                        data: Settings.ClientData,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'bearer ' + token);
                        },
                        success: function (d, textStatus, xhr) {
                            total = d;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(errorThrown);
                        }
                    });

                    return total;
                },
                model: {
                    id: "id",
                    fields: {
                        id: { editable: false, nullable: true },
                        name: { validation: { required: true } },
                        engineTypeID: { validation: { required: true } }
                    }
                }
            }
        });

        $("#table_Models").kendoGrid({
            dataSource: dataSource,
            toolbar: ["create"],
            sortable: true,
            scrollable: true,
            resizable: true,
            pageable: true,
            filterable: true,
            columns: [
                { field: "name", title: "Model", width: "120px" },
                {
                    field: "engineTypeID",
                    title: "Engine Type",
                    width: "150px",
                    template: "#=master.getEngineType(engineTypeID)#",
                    editor: function (container, options) {
                        $('<input required id="inline_ddl_' + options.field + '" name="' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                dataTextField: "name",
                                dataValueField: "id",
                                dataSource: {
                                    data: [
                                        { id: '91E4BC9C-8844-E811-80C4-BC305B849686', name: 'Engine' },
                                        { id: '92E4BC9C-8844-E811-80C4-BC305B849686', name: 'Generator' }
                                    ],
                                },
                            });
                    }
                },
                { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
            ],
            editable: "inline",
            //edit: function (e) {
            //    var model = e.model; //reference to the model that is about the be edited
            //    var container = e.container; //reference to the editor container
            //    var ddl = container.find("#inline_ddl_engineTypeID").data("kendoDropDownList");

            //    if (ddl) {
            //        ddl.value(model.engineTypeID);
            //    }
            //},
        });
    },

    configure_gearboxModelGird: function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoInlineGearboxModels",
                    type: "get",
                    dataType: "json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                update: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineGearboxModels/" + data.id;
                    },
                    type: "put",
                    dataType: "json",
                    //data: Settings.ClientData,
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                destroy: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineGearboxModels/" + data.id;
                    },
                    type: "delete",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_GearboxModels").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                create: {
                    url: Settings.WebApiUrl + "/api/KendoInlineGearboxModels",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_GearboxModels").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                parameterMap: function (options, operation) {
                    if (operation === "read") {
                        return {
                            aggregate: options.aggregate,
                            group: options.group,
                            filter: options.filter,
                            models: options.models,
                            page: options.page,
                            pageSize: options.pageSize,
                            take: options.take,
                            skip: options.skip,
                            sort: options.sort
                        }
                    }
                    else if (operation === "create" && options) {
                        return kendo.stringify({ name: options.name });
                    }
                    else if (operation === "update" && options) {
                        return kendo.stringify({ id: options.id, name: options.name });
                    }
                }
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            schema: {
                total: function (response) {
                    var total = response.length;
                    $.ajax({
                        type: 'get',
                        url: Settings.WebApiUrl + '/api/KendoInlineGearboxModelsTotal',
                        contentType: "application/json",
                        dataType: 'json',
                        async: false,
                        // passing token
                        //data: Settings.ClientData,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'bearer ' + token);
                        },
                        success: function (d, textStatus, xhr) {
                            total = d;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(errorThrown);
                        }
                    });

                    return total;
                },
                model: {
                    id: "id",
                    fields: {
                        id: { editable: false, nullable: true },
                        name: { validation: { required: true } }
                    }
                }
            }
        });

        $("#table_GearboxModels").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            toolbar: ["create"],
            columns: [
                { field: "name", title: "Gearbox Model", width: "120px" },
                { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
            ],
            editable: "inline"
        });
    },

    configure_shipClassesGird: function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoInlineShipClasses",
                    type: "get",
                    dataType: "json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                update: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineShipClasses/" + data.id;
                    },
                    type: "put",
                    dataType: "json",
                    //data: Settings.ClientData,
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                destroy: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineShipClasses/" + data.id;
                    },
                    type: "delete",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_ShipClasses").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                create: {
                    url: Settings.WebApiUrl + "/api/KendoInlineShipClasses",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_ShipClasses").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                parameterMap: function (options, operation) {
                    if (operation === "read") {
                        return {
                            aggregate: options.aggregate,
                            group: options.group,
                            filter: options.filter,
                            models: options.models,
                            page: options.page,
                            pageSize: options.pageSize,
                            take: options.take,
                            skip: options.skip,
                            sort: options.sort
                        }
                    }
                    else if (operation === "create" && options) {
                        return kendo.stringify({ name: options.name });
                    }
                    else if (operation === "update" && options) {
                        return kendo.stringify({ id: options.id, name: options.name });
                    }
                }
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            schema: {
                total: function (response) {
                    var total = response.length;
                    $.ajax({
                        type: 'get',
                        url: Settings.WebApiUrl + '/api/KendoInlineShipClassesTotal',
                        contentType: "application/json",
                        dataType: 'json',
                        async: false,
                        // passing token
                        //data: Settings.ClientData,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'bearer ' + token);
                        },
                        success: function (d, textStatus, xhr) {
                            total = d;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(errorThrown);
                        }
                    });

                    return total;
                },
                model: {
                    id: "id",
                    fields: {
                        id: { editable: false, nullable: true },
                        name: { validation: { required: true } }
                    }
                }
            }
        });

        $("#table_ShipClasses").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            toolbar: ["create"],
            columns: [
                { field: "name", title: "Ship Class", width: "120px" },
                { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
            ],
            editable: "inline"
        });
    },

    configure_shipTypesGird: function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoInlineShipTypes",
                    type: "get",
                    dataType: "json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                update: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineShipTypes/" + data.id;
                    },
                    type: "put",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                destroy: {
                    url: function (data) {
                        return Settings.WebApiUrl + "/api/KendoInlineShipTypes/" + data.id;
                    },
                    type: "delete",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_ShipTypes").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                create: {
                    url: Settings.WebApiUrl + "/api/KendoInlineShipTypes",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    //data: Settings.ClientData,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    complete: function (d, textStatus, xhr) {
                        var grid = $("#table_ShipTypes").data("kendoGrid");
                        grid.dataSource.read();
                        grid.refresh();
                    }
                },
                parameterMap: function (options, operation) {
                    if (operation === "read") {
                        return {
                            aggregate: options.aggregate,
                            group: options.group,
                            filter: options.filter,
                            models: options.models,
                            page: options.page,
                            pageSize: options.pageSize,
                            take: options.take,
                            skip: options.skip,
                            sort: options.sort
                        }
                    }
                    else if (operation === "create" && options) {
                        return kendo.stringify({ name: options.name });
                    }
                    else if (operation === "update" && options) {
                        return kendo.stringify({ id: options.id, name: options.name });
                    }
                }
            },
            pageSize: Settings.PageSize,
            serverPaging: true,
            schema: {
                total: function (response) {
                    var total = response.length;
                    $.ajax({
                        type: 'get',
                        url: Settings.WebApiUrl + '/api/KendoInlineShipTypesTotal',
                        contentType: "application/json",
                        dataType: 'json',
                        async: false,
                        // passing token
                        //data: Settings.ClientData,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'bearer ' + token);
                        },
                        success: function (d, textStatus, xhr) {
                            total = d;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(errorThrown);
                        }
                    });

                    return total;
                },
                model: {
                    id: "id",
                    fields: {
                        id: { editable: false, nullable: true },
                        name: { validation: { required: true } }
                    }
                }
            }
        });

        $("#table_ShipTypes").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            toolbar: ["create"],
            columns: [
                { field: "name", title: "Ship Type", width: "120px" },
                { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
            ],
            editable: "inline"
        });
    },
}