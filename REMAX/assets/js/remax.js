// Settings
var Settings = {
    WebApiUrl: 'http://localhost:56376/',
    Token: null,
    CurrentUser: null,
    PageSize: 5,
    TokenKey: 'currentToken',
    UserKey: 'currentUser',
    MessageLevel: 'info' // info, debug
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
    }
}



$(document).ready(function () {
    var currentUser, currentToken;

    if (window.location.href.indexOf('/login.html') > 0) return;

    if (localStorage.getItem('currentToken')) currentToken = localStorage.getItem('currentToken').toString();
    else if ($.cookie('currentToken')) currentToken = $.cookie('currentToken');

    if (localStorage.getItem('currentUser')) currentUser = localStorage.getItem('currentUser').toString();
    else if ($.cookie('currentUser')) currentUser = $.cookie('currentUser');

    if (!currentUser || !currentToken) {
        document.location = "/login.html?callbackurl=" + window.location.href;
    }
    else {
        Settings.Token = currentToken;
        Settings.CurrentUser = JSON.parse(currentUser);
    }
});

$(function() {
    $('#side-menu').metisMenu();
});

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
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});
