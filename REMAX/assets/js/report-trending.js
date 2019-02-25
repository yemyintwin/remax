var vessels;

var trending = {
    onload: function () {
        Util.displayLoading(document.body, true); //show loading and hide when all channels are loaded
        setTimeout(function () {
            loadMenu();
            trending.initControls();
            Util.displayLoading(document.body, false); //hide loading
        }, 100);

        $(window).resize(function () {
            $("#dataChart").data("kendoChart").refresh();
        });
    },

    initControls: function () {
        // Setting Datetime pickers
        $("#from").datepicker({
            format: "dd/mm/yyyy", // Notice the Extra space at the beginning
            autoclose: true
        });

        $("#to").datepicker({
            format: "dd/mm/yyyy", // Notice the Extra space at the beginning
            autoclose: true
        });

        $('#from').datepicker().datepicker('setDate', 'today');
        $('#to').datepicker().datepicker('setDate', 'today');
        $("#vessel").change(trending.vessel_OnChange);
        $("#btnGenerate").click(trending.btnGenerate_OnClick);

        // Retrieveing vessels
        if (Settings.Token) {
            $.ajax({
                type: 'GET',
                url: Settings.WebApiUrl + '/api/KendoVessels',
                dataType: 'json',
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
                },
                success: function (result, textStatus, jqXHR) {
                    if (result && result.data) vessels = result.data;

                    $('#vessel').find('option').remove().end();
                    jQuery.each(vessels, function (key, entry) {
                        $('#vessel').append($('<option></option>').attr('value', entry.id).text(entry.vesselName)).end();
                    });

                    $("#vessel").change();
                },
            });
        }


    },

    vessel_OnChange : function () {
        var id = $('#vessel').val();
        var found = jQuery.grep(vessels, function (v) {
            return v.id == id;
        });

        $('#engine').find('option').remove().end();
        if (found && found[0] && found[0].engines) {
            jQuery.each(found[0].engines, function (key, entry) {
                $('#engine').append($('<option></option>').attr('value', entry.id).text(entry.serialNo)).end();
            });
        }
    },

    btnGenerate_OnClick: function () {
        var vesselId = $('#vessel').val();
        var engineId = $('#engine').val();
        var from = $('#from').val();
        var to = $('#to').val();
        var errorMsg = '';
        var fromDate, toDate;

        if (!vesselId) errorMsg += "<p>Vessel is not selected.</p>";
        if (!engineId) errorMsg += "<p>Engine is not selected.</p>";
        if (!from) errorMsg += "<p>From date is not selected.</p>";
        if (!to) errorMsg += "<p>To date is not selected.</p>";

        if (from && to) {
            var fromArray = from.split('/');
            var toArray = to.split('/');
            if (fromArray.length == 3 && toArray.length == 3) {
                fromDate = new Date(fromArray[1] + '/' + fromArray[0] + '/' + fromArray[2]);
                toDate = new Date(toArray[1] + '/' + toArray[0] + '/' + toArray[2]);
                if (fromDate > toDate) errorMsg += "<p>From date is must be earlier than to date.</p>";
            }
        } 

        if (errorMsg && errorMsg != '') {
            $('#errors').html('');
            $('#errors').append(errorMsg);
            $('#messageModal').modal('show');
        }
        else {

            Util.displayLoading(document.body, true);
            $('#btnGenerate').prop('disabled', true);

            var strFromDate = fromDate.getFullYear() + '-' + (fromDate.getMonth() + 1) + '-' + fromDate.getDate();
            var strToDate = toDate.getFullYear() + '-' + (toDate.getMonth() + 1) + '-' + toDate.getDate();

            /*
            $.ajax({
                type: 'GET',
                url: Settings.WebApiUrl + '/api/KendoMonitorings/GetData',
                data: {
                    vesselId: vesselId,
                    engineId: engineId,
                    fromDate: strFromDate,
                    toDate: strToDate
                },
                dataType: 'json',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
                },
                success: function (result, textStatus, jqXHR) {
                    var dayDiff = Util.date_diff_indays(fromDate, toDate);
                    var baseUnit = 'fit';

                    if (dayDiff >= 0 || dayDiff <= 1) baseUnit = 'hours';
                    else if (dayDiff > 1 && dayDiff <= 14) baseUnit = 'days';
                    else if (dayDiff > 14 ) baseUnit = 'weeks';

                    if (result) {
                        $("#dataChart").kendoChart({
                            title: {
                                text: $('#engine option:selected').text()
                            },
                            legend: {
                                position: "bottom"
                            },
                            dataSource: {
                                data: result
                            },
                            series: [{
                                type: "line",
                                field: "value",
                                categoryField: "timeStamp"
                            }],
                            categoryAxis: {
                                baseUnit: 'fit'
                            }
                        });
                    }

                    Util.displayLoading(document.body, false);
                    $('#btnGenerate').prop('disabled', false);
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');

                    Util.displayLoading(document.body, false);
                    $('#btnGenerate').prop('disabled', false);
                }
            });
            */

            var param = 'vesselId=' + vesselId + '&engineId=' + engineId + '&fromDate=' + strFromDate + '&toDate=' + strToDate;

            var dayDiff = Util.date_diff_indays(fromDate, toDate);
            var baseUnit = 'fit';

            if (dayDiff >= 0 && dayDiff <= 1) baseUnit = 'hours';
            else if (dayDiff > 1 && dayDiff <= 14) baseUnit = 'days';
            else if (dayDiff > 14) baseUnit = 'weeks';

            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: Settings.WebApiUrl + '/api/KendoMonitorings/GetData?' + param,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
                        }
                    },
                },
                group: {
                    field: "channelName"
                },
                sort: {
                    field: "timeStamp",
                    dir: "asc"
                }
            });
            $("#dataChart").kendoChart({
                title: { text: $('#engine option:selected').text() },
                dataSource: dataSource,
                series: [{
                    type: "line",
                    field: "value",
                    categoryField: "timeStamp",
                    name: "#= group.value #"
                }],
                legend: {
                    position: "bottom"
                },
                categoryAxis: {
                    type: "date",
                    baseUnit: baseUnit
                }
            });

            Util.displayLoading(document.body, false);
            $('#btnGenerate').prop('disabled', false);
        }
    }
}