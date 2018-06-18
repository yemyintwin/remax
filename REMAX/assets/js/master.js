var token;

var master = {

    onload: function () {
        if (!token) {
            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
        }

        master.configure_altMakerGird();
    },

    configure_altMakerGird: function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoInlineAlternatorMaker",
                    type: "get",
                    dataType: "json",
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
                    //else if (operation === "destroy" && options) {
                    //    return "/" + options.id;
                    //}
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

        /*
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: Settings.WebApiUrl + "/api/KendoAlternatorMakers",
                    type: "get",
                    dataType: "json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                },
                create: {
                    url: Settings.WebApiUrl + "/api/KendoAlternatorMakers",
                    type: "post",
                    dataType: "json",
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
                    switch (type) {
                        case "create":
                            return { models: kendo.stringify(selectedItem) };
                            break;
                        default:
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
            sort: { field: "name", dir: "asc" },
        });

        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "name",
                title: "Alternater Maker Name",
                filterable: {
                    extra: false
                }
            },
            { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
        ];

        $("#table_altMakers").kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true,
            selectable: "row",
            toolbar: ["create"],
            editable: "inline"
        });
        */
    },
}