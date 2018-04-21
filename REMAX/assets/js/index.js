var index = {
    createChart : function () {
        var dateObj = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        var month = dateObj.getMonth(); //months from 1-12
        var day = dateObj.getDate();
        var year = dateObj.getFullYear();

        today = day + " " + monthNames[month] + " " + year;

        $("#chart1").kendoChart({
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
            series: [{
                name: "PRINCESS SEAWAYS",
                data: [100, 110, 120, 105, 100, 120, 110, 115, 100, 130],
                style: "step"
            }, {
                name: "QUEEN ELIZABETH",
                data: [150, 160, 170, 155, 145, 160, 165, 153, 149, 152],
                style: "step"
            }, {
                name: "BITHIA",
                data: [120, 130, 125, 130, 0, 0, 0, 0, 111, 128],
                style: "step"
            }
            ],
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
                categories: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"],
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
    },

    onload: function () {
        

        index.createChart();
        $(document).bind("kendo:skinChange", index.createChart);

        $(window).resize(function () {
            $("#chart1").data("kendoChart").refresh();
        });
    }
}