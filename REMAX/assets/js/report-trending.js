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
            var chart = $("#dataChart").data("kendoChart");
            if (chart) chart.refresh();
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
        $("#engine").change(trending.engine_OnChange);
        $("#channel").change(trending.channel_OnChange);
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
            return v.id === id;
        });

        $('#engine').find('option').remove().end();
        if (found && found[0] && found[0].engines) {
            jQuery.each(found[0].engines, function (key, entry) {
                $('#engine').append($('<option></option>').attr('value', entry.id).text(entry.serialNo)).end();
            });
        }

        $("#engine").change();
    },

    engine_OnChange: function () {
        var engine;
        var engineSide=-1;

        var engineId = $('#engine').val();
        var id = $('#vessel').val();
        var found = jQuery.grep(vessels, function (v) {
            return v.id === id;
        });
        if (found && found[0] && found[0].engines) {
            engine = jQuery.grep(found[0].engines, function (e) {
                return e.id === engineId;
            });
        }
        if (engine && engine[0] && engine[0].side) {
            engineSide = engine[0].side;
        }

        // Retrieveing channels
        if (Settings.Token) {
            $.ajax({
                type: 'GET',
                url: Settings.WebApiUrl + 'api/KendoChannels/GetChannels',
                data: { id: engineId},
                dataType: 'json',
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
                },
                success: function (result, textStatus, jqXHR) {
                    if (result) channels = result;

                    $('#channel').find('option').remove().end();
                    jQuery.each(channels, function (key, entry) {
                        if (engineSide === entry.side) {
                            var name = entry.channelNo.toString() + ' (' + entry.name.toString() + ')';
                            $('#channel').append($('<option></option>').attr('value', entry.id).text(name)).end();
                        }
                    });

                    $('.selectpicker').selectpicker('refresh');

                    //$("#channel").selectpicker();
                    $("#channel").change();
                }
            });
        }
    },

    channel_OnChange: function () {
        
    },

    btnGenerate_OnClick: function () {
        var vesselId = $('#vessel').val();
        var engineId = $('#engine').val();
        var channelId = $('#channel').val();
        var from = $('#from').val();
        var to = $('#to').val();
        var errorMsg = '';
        var fromDate, toDate;

        if (!vesselId) errorMsg += "<p>Vessel is not selected.</p>";
        if (!engineId) errorMsg += "<p>Engine is not selected.</p>";
        if (!channelId) errorMsg += "<p>Channel is not selected.</p>";
        if (!from) errorMsg += "<p>From date is not selected.</p>";
        if (!to) errorMsg += "<p>To date is not selected.</p>";

        if (from && to) {
            var fromArray = from.split('/');
            var toArray = to.split('/');
            if (fromArray.length === 3 && toArray.length === 3) {
                fromDate = new Date(fromArray[1] + '/' + fromArray[0] + '/' + fromArray[2]);
                toDate = new Date(toArray[1] + '/' + toArray[0] + '/' + toArray[2]);
                if (fromDate > toDate) errorMsg += "<p>From date is must be earlier than to date.</p>";
            }
        } 

        if (errorMsg && errorMsg !== '') {
            $('#errors').html('');
            $('#errors').append(errorMsg);
            $('#messageModal').modal('show');
        }
        else {

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

            //Settings.WebApiUrl + 'api/KendoChannels/' + channelId
            var displayUnit = '';

            $.each(channelId, function (i) {
                $.ajax({
                    type: 'GET',
                    url: Settings.WebApiUrl + 'api/KendoChannels/' + this,
                    dataType: 'json',
                    async: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
                    },
                    success: function (result, textStatus, jqXHR) {
                        var tempUnit = result.displayUnit;
                        if (displayUnit.indexOf(tempUnit) < 0) {
                            if (displayUnit && displayUnit.length !== 0) displayUnit += ', ';
                            displayUnit += tempUnit;
                        }
                    }
                });
            });

            var param = 'vesselId=' + vesselId + '&engineId=' + engineId + '&channelId=' + channelId + '&fromDate=' + strFromDate + '&toDate=' + strToDate;

            var dayDiff = Util.date_diff_indays(fromDate, toDate);
            var baseUnit = 'fit'; // fit, milliseconds, seconds, minutes, hours, days, weeks, months, years
            var labelSteps = 1;
            var format = "HH:mm";
            var missingValues = "zero"; // interpolate, gap, zero;
            var baseUnitStep = 1;
            var catAxisTitle = '';

            if (dayDiff >= 0 && dayDiff <= 2) {
                baseUnit = 'minutes';
                baseUnitStep = 10;
                labelSteps = 3;
                format = 'hh:mm';
                catAxisTitle = 'Interval (10 minute)';
            }
            else if (dayDiff > 2) {
                baseUnit = 'hours';
                baseUnitStep = 1;
                labelSteps = 24;
                format = 'd/MMM';
                catAxisTitle = 'Interval (hour)';
            }
            else if (dayDiff > 30*3) {
                baseUnit = 'days';
                baseUnitStep = 1;
                labelSteps = 5;
                format = 'd/MMM';
                catAxisTitle = 'Interval (days)';
            }

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

            // Spin all loading indicators on the page
            kendo.ui.progress($(".chart-loading"), true);
            $("#dataChart").kendoChart({
                title: { text: $('#engine option:selected').text() },
                dataSource: dataSource,
                valueAxis: {
                    title: {
                        text: displayUnit,
                        font: "12px sans-serif"
                    }
                },
                series: [{
                    type: "line",
                    missingValues: missingValues,
                    style: "normal",
                    markers: {
                        visible: false
                    },
                    field: "value",
                    categoryField: "timeStamp",
                    name: "#= group.value #"
                }],
                legend: {
                    position: "bottom"
                },
                categoryAxis: {
                    type: "date",
                    baseUnit: baseUnit,
                    baseUnitStep: baseUnitStep,
                    labels: {
                        step: labelSteps,
                        rotation: 270,
                        dateFormats: {
                            minutes: format,
                            hours: format,
                            days: format
                        }
                    },
                    majorGridLines: {
                        step: labelSteps
                    },
                    title: {
                        text: catAxisTitle,
                        font: "12px sans-serif"
                    }
                },
                tooltip: {
                    visible: true,
                    template: "${category} : ${value}"
                },
                render: function (e) {
                    var loading = $(".chart-loading", e.sender.element.parent());
                    kendo.ui.progress(loading, false);
                    $('#btnGenerate').prop('disabled', false);
                }
            });
        }
    }
}