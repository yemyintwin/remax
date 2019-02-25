// Settings
var Settings = {
    //WebApiUrl: 'http://localhost:56376/', // DEV
    WebApiUrl: 'http://hiroodaikai-001-site1.atempurl.com/', // UAT
    Token: null,
    CurrentUser: null,
    PageSize: 5,
    TokenKey: 'currentToken',
    UserKey: 'currentUser',
    MessageLevel: 'info', // info, debug    
}


// Utility functions
var Util = {

    parse_query_string: function (query) {
        var vars = query.split("&");
        var query_string = {};
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    },

    isEmail: function (email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    },

    displayLoading: function(target, show) {
        var element = $(target);
        kendo.ui.progress(element, show);
    },

    convertToLocalTime: function (utcDate) {
        var utcTime = new Date(utcDate);
        var localTime = new Date(utcTime.getTime() + (utcTime.getTimezoneOffset() * 60000 * (-1)));
        return localTime;
    },

    date_diff_indays : function (date1, date2) {
        dt1 = new Date(date1);
        dt2 = new Date(date2);
        return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
    },

    today: function () {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = mm + '/' + dd+ '/' + yyyy;
        return today;
    }
}

includeHTML = function () {
    var z, i, elmnt, file, xhttp;
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /*make an HTTP request using the attribute value as the file name:*/
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status === 404) { elmnt.innerHTML = "Page not found."; }
                    /*remove the attribute, and call this function once more:*/
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();

                    if (file == 'nav.html') loadMenu();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /*exit the function:*/
            return;
        }
    }
    $('#side-menu').metisMenu();
};

function loadMenu() {
    // debugger;
    var currentUser, currentToken, clientId;

    if (window.location.href.indexOf('/login.html') > 0) return;

    if (localStorage.getItem('currentToken')) currentToken = localStorage.getItem('currentToken').toString();
    else if ($.cookie('currentToken')) currentToken = $.cookie('currentToken');

    if (localStorage.getItem('currentUser')) currentUser = localStorage.getItem('currentUser').toString();
    else if ($.cookie('currentUser')) currentUser = $.cookie('currentUser');

    if (!currentUser || !currentToken) {
        document.location = "/login.html?callbackurl=" + window.location.href;
    }
    else {
        Settings.Token = JSON.parse(currentToken);
        Settings.CurrentUser = JSON.parse(currentUser);
        Settings.ClientData = { client_id: Settings.Token['as:client_id'], refresh_token: Settings.Token.refresh_token };
        if (new Date(Settings.Token['.expires']) < new Date()) {
            // Check current refresh toekn and call to refresh token
            if (Settings.Token.refresh_token && Settings.Token['as:client_id']) {
                var loginData = {
                    grant_type: 'refresh_token',
                    refresh_token: Settings.Token.refresh_token,
                    client_id: Settings.Token['as:client_id'],
                    client_secret: null,
                    scope: null
                };

                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    async: false,
                    url: Settings.WebApiUrl + '/Token',
                    data: loginData,
                    success: function (data) {
                        var sData = JSON.stringify(data);
                        try {
                            $.cookie('currentToken', sData);
                        } catch (e) {
                            console.assert(e.message);
                        }
                        localStorage.setItem('currentToken', sData);
                        Settings.Token = data;
                    },
                    error: function (xhr) {
                        document.location = "/login.html?callbackurl=" + window.location.href;
                    }
                });
            }
            else {
                document.location = "/login.html?callbackurl=" + window.location.href;
            }
        }
    }

    // Dynamics navigation
    var found = false;
    if (Settings.CurrentUser && Settings.CurrentUser.userRoles) {
        var roles = Settings.CurrentUser.userRoles;
        for (var i = 0; i < roles.length; i++) {
            if (roles[i].name.toLowerCase() === 'admin' || roles[i].name.toLowerCase() === 'root') {
                found = true; break;
            }
        }
    }

    if (Settings.CurrentUser && Settings.CurrentUser.fullName) {
        $('#welcome').text('Welcome ' + Settings.CurrentUser.fullName);
    }

    if (!found) {
        $('#nav_registration').hide();
        $('#nav_master').hide();
    }

    // vessels list
    if (Settings.Token) {
        /*
         * if (vessel && vessel.data) {
            vesselMenu(vessel, '', jqXHR);
        }
        */
        $.ajax({
            type: 'GET',
            url: Settings.WebApiUrl + '/api/KendoVessels',
            dataType: 'json',
            async: false,
            //data: Settings.ClientData,
            //headers: {
            //    "Authorization": 'bearer ' + Settings.Token.access_token
            //},
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
            },
            success: vesselMenu,
            error: function (xhr, status, error) {
                document.location = "/login.html?callbackurl=" + window.location.href;
            }
            
        });
    }
}

vesselMenu = function (result, textStatus, jqXHR) {
    //Process data retrieved
    var root = $("#nav_vessel_list");

    var vesselsCount, enginesCount, generatorsCount, alertCount;
    vesselsCount = enginesCount = generatorsCount = alertCount = 0;

    var lastAlerted = new Date(0);

    // removing loading
    $("#vesselLoading").remove();

    // adding vessels menu
    for (var i = 0; i < result.data.length; i++) {
        vesselsCount++;

        var ves = result.data[i];
        var vesMenu = root.append("<li id='ves_" + ves.imO_No + "'></li>").find("#ves_" + ves.imO_No);
        vesMenu.append("<a href='#'>" + ves.vesselName.toUpperCase() + "<span class='fa arrow'/></a>");

        // engines
        var engMenu = vesMenu.append("<ul id='vesEng_" + ves.imO_No + "' class='nav nav-third-level collapse'></ul>").find("#vesEng_" + ves.imO_No);

        for (var j = 0; j < ves.engines.length; j++) {
            var eng = ves.engines[j];
            var engineUrl = "engine.html?engine=" + eng.id;
            engMenu.append("<li><a href='" + engineUrl + "'>" + eng.serialNo + "</a></li>");

            if (eng.engineType && eng.engineType.name) {
                if (eng.engineType.name === "Engine") enginesCount++;
                else if (eng.engineType.name === "Generator") generatorsCount++;
            }

            if (eng.alerts && eng.alerts.length) {
                alertCount += eng.alerts.length;
                var maxDate = new Date(Math.max.apply(null, eng.alerts.map(function (a) {return new Date(a.alertTime);})));
                if (maxDate instanceof Date && !isNaN(maxDate.valueOf())) {
                    var localTime = Util.convertToLocalTime(maxDate);
                    if (localTime instanceof Date && !isNaN(localTime.valueOf())) {
                        lastAlerted = new Date(localTime.getTime() - new Date().getTime());
                    }
                }
            }
        }
    }

    if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '/index.htm') {
        // Index (home) page
        $("#count_vessels").html(vesselsCount);
        $("#count_engines").html(enginesCount);
        $("#count_generators").html(generatorsCount); 
        $("#count_alerts").html(alertCount); 
    }

    $("#bell_alert").text(alertCount); 

    if (lastAlerted && lastAlerted.getTime && lastAlerted.getTime() != 0 ) {
        var ago = lastAlerted.getHours() + ':' + lastAlerted.getMinutes() + ' hour ago';
        $("#bell_alert_ago").text(ago);
        $("#bell_msg_ago").text(ago);
    }
    
    $('#side-menu').metisMenu();
}

//$(function () {
//    $('#side-menu').metisMenu();
//});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size

$(function() {
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        return this.href === url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});
