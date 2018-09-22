var index = {
    
    onload: function () {

        // Values set inside remax.js
        if (Settings.Counts && Settings.Counts.vessel) $("count_vessels").html(Settings.Counts.vessel)
        else $("count_vessels").html(0);

        if (Settings.Counts && Settings.Counts.engine) $("count_engines").html(Settings.Counts.vessel)
        else $("count_engines").html(0);

        if (Settings.Counts && Settings.Counts.generator) $("count_generators").html(Settings.Counts.vessel)
        else $("count_generators").html(0);

        index.createChart();
        $(document).bind("kendo:skinChange", index.createChart);

        $(window).resize(function () {
            $("#chart1").data("kendoChart").refresh();
        });
    },

    createChart: function () {
        var dateObj = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        var month = dateObj.getMonth(); //months from 1-12
        var day = dateObj.getDate();
        var year = dateObj.getFullYear();

        today = day + " " + monthNames[month] + " " + year;

        $.ajax({
            type: 'GET',
            url: Settings.WebApiUrl + 'api/KendoMonitorings/GetTodayData',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
            },
            success: function (data, textStatus, jqXHR) {
                var d = data;

                // finding unique vessel
                var vessleNames = [];
                $.each(data, function (key, value) {
                    var vName = value.vesselName + "(" + value.imO_No + ")";
                    if (jQuery.inArray(vName, vessleNames) == -1)
                        vessleNames.push(vName);
                });

                // series data objects
                var values = new Array(vessleNames.length); // first dimension (ship name)
                for (var i = 0; i < values.length; i++) { //second dimension (hour)
                    values[i] = new Array(24);
                    for (var j = 0; j < values[i].length; j++) { // third dimension (half and hour)
                        values[i][j] = new Array(2);
                    }
                }

                $.each(data, function (key, value) {
                    var vName = value.vesselName + "(" + value.imO_No + ")";
                    var vIndex = jQuery.inArray(vName, vessleNames);
                    var hIndex = value.hours - 1;
                    var hhIndex = value.halfHours;

                    values[vIndex][hIndex][hhIndex] = value.count;
                    //values[vIndex][hIndex]
                });

                var series = [];
                var categories = [];

                for (var i = 0; i < 24; i++) {
                    var hour = (i < 10 ? "0" : "") + i.toString();
                    categories.push(hour);
                }

                for (var i = 0; i < vessleNames.length; i++) {
                    var vName = vessleNames[i];
                    var vData = new Array(24); // 24 hours 

                    for (var j = 0; j < values[i].length; j++) {
                        for (var k = 0; k < values[i][j].length; k++) {
                            vData[j] = (vData[j] ? vData[j] : 0) + (values[i][j][k] ? values[i][j][k] : 0);
                        }
                    }

                    vData.unshift(0);

                    series.push({
                        name: vName,
                        data: vData,
                        style: "step"
                    });
                }
                
                $("#dataChart").kendoChart({
                    title: {
                        text: today
                    },
                    legend: {
                        position: "bottom"
                    },
                    chartArea: {
                        background: ""
                    },
                    seriesDefaults: {
                        type: "column",
                        style: "smooth",
                        stack: true
                    },
                    series: series,
                    valueAxis: {
                        labels: {
                            format: "{0}"
                        },
                        line: {
                            visible: false
                        },
                        axisCrossingValue: -10
                    },
                    categoryAxis: {
                        categories: categories,
                        majorGridLines: {
                            visible: false
                        },
                        labels: {
                            rotation: "auto"
                        }
                    },
                    tooltip: {
                        visible: true,
                        format: "{0}",
                        template: "#= series.name #: #= value #"
                    }
                });
            }
        });
    },


}