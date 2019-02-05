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

var alerts = {
    modules: {
        settings: null
    },

    onload: function () {
        if (!token) {
            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
        }

        Util.displayLoading(document.body, true); //show loading and hide when all channels are loaded

        setTimeout(function () {
            alerts.modules.settings = {
                gridId: '#table_alerts',
                formId: '#form_alerts',
                dialogId: '#dialog_alerts',
                webApiUrl: Settings.WebApiUrl + '/api/KendoAlerts',
            };

            alerts.retrieveSettings(); // kendo grid id

            Util.displayLoading(document.body, false); //show loading and hide when all channels are loaded
        }, 100);
    },

    retrieveSettings : function () {
        var pageNumber = 1;
        var url = alerts.modules.settings.webApiUrl;

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
                field: "alertTime",
                title: "Alert Time",
                filterable: {
                    extra: false
                },
                width: 150,
                template: function (dataItem) {
                    var d = new Date(Util.convertToLocalTime(dataItem.alertTime));
                    return kendo.toString(kendo.parseDate(d), "dd/MM/yyyy HH:mm");
                }
            },
            {
                field: "imO_No",
                title: "IMO No.",
                filterable: {
                    extra: false
                },
                width: 150
            },
            {
                field: "serialNo",
                title: "Engien Serial No",
                filterable: {
                    extra: false
                },
                width: 150
            },
            {
                title: "Alert Setting",
                filterable: false,
                template: "#= channelName + ' ' + conditionValue + ' ' + alertValue #",
                width: 250
            },
            {
                field: "alertLevelValue",
                title: "Alert Level",
                filterable: false,
                width: 250
            },
            {
                field: "documentURL",
                title: "Document URL",
                filterable: false,
                width: 250,
                template: function (dataItem) {
                    return (dataItem.documentURL ? "<a href='" + documentURL + "'>Open</a>"  : "");
                }
            },
            {
                field: "alertMessage",
                title: "Alert Message",
                filterable: false,
                width: 250
            },
        ];

        // initialize grid
        $("#table_alerts").kendoGrid({
            dataSource: dataSource,
            columns: columns,
            filterable: true,
            sortable: true,
            pageable: true,
            selectable: "row",
            change: alerts.alertGrid_OnChange,
        });

        // assgining grid to global variable
        var grid = $(alerts.modules.settings.gridId).data("kendoGrid");
        alerts.modules.settings.grid = grid;
    },

    alertGrid_OnChange: function (arg) {
        var grid = alerts.modules.settings.grid;
        var selectedItem = grid.dataItem(grid.select());
        var cardTemplate = "<div class='card'>" +
            "<div class='container'>" + 
            "    <h4><b>Email To:</b>{{cardTo}}</h4>" +
            "    <h4><b>Subject: </b>{{cardSubject}}</h4>" +
            "    <h4><b>Alerted Time: </b>{{alertTime}}</h4>" +
            "    <h4><b>Email Message: </b></h4>" +
            "    <p>{{cardMsg}}</p>" +
            "    </div>" +
            "</div >";
        if (selectedItem) {
            var divHtml = cardTemplate;
            //var alertTime = new Date(selectedItem.alertTime);
            //var localTime = new Date(alertTime.getTime() + (alertTime.getTimezoneOffset() * 60000 * (-1)));

            var localTime = Util.convertToLocalTime(selectedItem.alertTime);

            divHtml = divHtml.replace(/{{cardTo}}/g, selectedItem.recipients);
            divHtml = divHtml.replace(/{{cardSubject}}/g, selectedItem.subject);
            divHtml = divHtml.replace(/{{alertTime}}/g, localTime);
            divHtml = divHtml.replace(/{{cardMsg}}/g, selectedItem.alertEmailMessage);
            $('#alert_message').html(divHtml);
        }
        else {
            $('#alert_message').html('');
        }
    }
}