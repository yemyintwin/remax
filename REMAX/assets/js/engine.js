var token;
var isDateField = [];

var engine = {
    id : '',
    pageSettings: {
        url: Settings.WebApiUrl + '/api/KendoEngines',
    },

    onload: function () {
        if (!token) {
            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
        }

        var params = Util.parse_query_string(window.location.search.substring(1));
        if (params && params.engine) {
            engine.id = params.engine;
            engine.retrieveEngine();
        }
    },

    retrieveEngine: function () {
        $.ajax({
            type: 'GET',
            url: Settings.WebApiUrl + '/api/KendoEngines/' + engine.id,
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: engine.displayChannelData
        });
    },

    displayChannelData: function (result) {
        // Header Section
        if (result) {
            var engineId;
            var heading = '';

            if (result.vessel && result.vessel.vesselName) heading = result.vessel.vesselName + ' - ';
            if (result.serialNo) heading += result.serialNo;
            if (result.model && result.model.name) heading += ' (' + result.model.name + ')';
            else heading += ' ( Nil )';
            $('#engine_no').text(heading);

            // ChannelData
            if (result.id) engineId = result.id;
            engine.loadMonitoringGrid(engineId);
            engine.loadGauges(engineId);
        }
    },

    preprocessData: function(data) {
        // iterate over all the data elements replacing the Date with a version
        // that Kendo can work with.
        $.each(data.data, function (index, item) {
            item.timeStamp = kendo.parseDate(item.timeStamp);
        });
        return data;
    },

    loadMonitoringGrid: function (engineId) {
        var gridId = '#table_Monitoring';
        var pageNumber = 1;
        var url = Settings.WebApiUrl + '/api/KendoMonitorings';

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
            schema: {
                //parse: function (data) {
                //    return engine.preprocessData(data);
                //},
                // describe the result format
                model: {
                    id: "id",
                    fields: {
                        $type:{},
                        channelName: {},
                        channelNo: {},
                        chartType: {},
                        displayUnit: {},
                        engineID: {},
                        engineModelID: {},
                        id: {},
                        imoNo: {},
                        incomingChannelName: {},
                        modelName: {},
                        processed: {},
                        serialNo: {},
                        timeStamp: { type: "date", format: "dd/MM/yyyy"},
                        value: {},
                        vesselName: {}
                    }
                },
                data: "data", // records are returned in the "data" field of the response
                total: "total" // total number of records is in the "total" field of the response
            },
            pageSize: 10,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: [
                { field: "timeStamp", dir: "desc" }
            ],
            filter: { field: "EngineID", operator: "eq", value: engineId }
        });

        // column settings

        var columns = [
            {
                field: "id",
                title: "ID",
                hidden: true
            },
            {
                field: "timeStamp",
                title: "Time Stamp",
                width: 150,
                type: "date",
                filterable: {
                    ui: function (element) {
                        element.kendoDatePicker({
                            format: "dd/MM/yyyy"
                        });
                    },
                    extra: false,
                    operators: {
                        date: {
                            eq: "Equal",
                            gte: "After or equal to",
                            lte: "Before or equal to"
                        }
                    }
                },
                template: '#= kendo.toString(kendo.parseDate(timeStamp), "dd/MM/yyyy HH:mm")#'
            },
            {
                field: "channelNo",
                title: "Channel No.",
                filterable: {
                    extra: false
                },
                width: 150
            },
            {
                field: "channelName",
                title: "Channel Name",
                filterable: {
                    extra: false
                },
                width: 200
            },
            {
                field: "value",
                title: "Value",
                type: "date",
                filterable: {
                    extra: false
                },
                width: 100
            },
            {
                field: "displayUnit",
                title: "Unit",
                filterable: false,
                width: 100
            }
        ];

        kendo.ui.FilterMenu.fn.options.operators.string = {
            contains: "Contains",
            doesnotcontain: "Does not contains",
            eq: "Equal to",
            neq: "Not equal to",
            startswith: "Starts with",
            endswith: "Ends with"
        };

        // initialize grid
        $(gridId).kendoGrid({
            dataSource: dataSource,
            columns: columns,
            sortable: true,
            scrollable: true,
            resizable: true,
            pageable: true,
            filterable: true,
            selectable: "row",
        });

        // assgining grid to global variable
        var grid = $(gridId).data("kendoGrid");
        
        grid.bind("filter", function (e) {
            var found = false;

            if (e.filter == null) {
                console.log("filter has been cleared");
            } else {

                for (var i = 0; i < e.filter.filters.length; i++) {
                    var field = e.filter.filters[i].field;
                    var value = e.filter.filters[i].value;

                    if (field.toLowerCase() == "EngineID") found = true;
                }

                if (!found) {
                    var engineFilter = { field: "EngineID", operator: "eq", value: engineId };
                    e.filter.filters.push(engineFilter);
                }
            }
        });
        
    },

    loadGauges: function (engineId) {
        $.ajax({
            type: 'GET',
            url: Settings.WebApiUrl + 'api/KendoMonitorings/GaugueViews',
            dataType: 'json',
            data: { id: engineId },
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
            },
            success: engine.showGaugeDashboard
        });
    },

    showGaugeDashboard: function (result, textStatus, jqXHR) {
        var panelRoot = $('#gauges'); // accordion root element

        var divTemplate =
            '<div class="col-lg-4 col-md-6 col-sm-12 col-xs-12">' +
            '    <div class="panel panel-default">' +
            '        <div class="panel-body">' +
            '            <div>' +
            '                <div id="channel_{{channelNo}}_Time" class="gauge"></div>' +
            '                <div id="channel_{{channelNo}}" class="gauge"></div>' +
            '            </div>' +
            '        </div>' +
            '        <div class="panel-footer">' +
            '            <span class="pull-left">{{channelName}}</span>' +
            '            <span class="pull-right"></span>' + //<i class="fa fa-arrow-circle-right"></i> //Arrow on right align
            '            <div class="clearfix"></div>' +
            '        </div>' +
            '    </div>' +
            '</div>';

        $.each(result, function (index) {
            var gaugeObj = result[index];

            var divHtml = divTemplate;

            var c = gaugeObj.channelSetup;
            var v = gaugeObj.monitoringLastValue;

            if (c) {
                divHtml = divHtml.replace(/{{channelNo}}/g, c.channelNo);
                divHtml = divHtml.replace(/{{channelName}}/g, c.channelNo + ' (' + c.name + ' - ' + c.displayUnit + ')');

                $(divHtml).appendTo(panelRoot);

                if (v) {
                    var d = new Date(v.timeStamp);
                    if (d) $("#channel_" + c.channelNo + "_Time").append("<span>" + d.toLocaleDateString() + " " + d.toLocaleTimeString()  + "</span>")

                    // Draw gauge
                    $("#channel_" + c.channelNo).css({ width: "300px", height: "200px" }).kendoRadialGauge({
                        pointer: {
                            value: v.value
                        },
                        scale: {
                            minorUnit: c.scale,
                            startAngle: -30,
                            endAngle: 210,
                            max: c.maxRange,
                            ranges: [
                                {
                                    from: c.upperLimit,
                                    to: c.maxRange,
                                    color: "#c20000"
                                }
                            ]
                        }
                    });// end of gauge drawing
                }// end of last value
            } // check channel
        });// end of for each
    }
}