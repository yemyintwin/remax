var login = {
    tokenKey: 'currentToken',
    userKey: 'currentUser',

    performLogOut: function () {
        var currentUser, currentToken, clientId;

        //debugger;

        $('#login').prop('disabled', false);
        $('#login').text("Login");

        if (localStorage.getItem('currentToken')) currentToken = localStorage.getItem('currentToken').toString();
        if ($.cookie('currentToken')) currentToken = $.cookie('currentToken');

        if (localStorage.getItem('currentUser')) currentUser = localStorage.getItem('currentUser').toString();
        if ($.cookie('currentUser')) currentUser = $.cookie('currentUser');

        if (currentToken) {
            Settings.Token = JSON.parse(currentToken);

            if (Settings.Token.refresh_token && Settings.Token['as:client_id']) {
                var clientId = Settings.Token['as:client_id'];

                $.ajax({
                    type: 'DELETE',
                    url: Settings.WebApiUrl + '/api/Clients/' + clientId,
                    dataType: 'json',
                    async: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + Settings.Token.access_token);
                    },
                    error: function (xhr, status, error) {
                        console.log(error);
                    }
                });
            }
        }

        if (localStorage.getItem('currentToken')) localStorage.removeItem('currentToken')
        if ($.cookie('currentToken')) $.removeCookie('currentToken');

        if (localStorage.getItem('currentUser')) localStorage.removeItem('currentUser')
        if ($.cookie('currentUser')) $.removeCookie('currentUser');
    },

    performLogin: function () {
        localStorage.removeItem(login.tokenKey); 
        localStorage.removeItem(login.userKey); 

        try { $.cookie.removeItem(login.tokenKey); } catch (e) { console.log(e.message); }
        try { $.cookie.removeItem(login.userKey); } catch (e) { console.log(e.message); }

        var clientid = btoa($('#email').val().toString() + new Date().toString());
        var rememberme = $('#remember').prop('checked') && $('#remember').prop('checked') == 1;

        var loginData = {
            grant_type: 'password',
            username: $('#email').val(),
            password: $('#password').val()
        };

        if (rememberme) {
            loginData.client_id = clientid;
        }

        $('#login').prop('disabled', true);
        $('#login').text("Authenticating...");

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: Settings.WebApiUrl + '/Token',
            data: loginData
        }).done(function (data) {
            //debugger;
            // Cache the access token in session storage.

            /*
            if (data) {
                var now = new Date();
                data.expires_in_date = new Date(data['.expires']);
                data.remember_me = $('#remember').prop('checked');
            }
            */

            try {
                $.cookie(login.tokenKey, JSON.stringify(data));
            } catch (e) {
                console.assert(e.message);
            }
            localStorage.setItem(login.tokenKey, JSON.stringify(data));
       
            var success = login.getCurrentUserInfo(data.access_token);
            var twoFASuccess = false;

            // Password Correct
            if (success) {

                var intCount = 1;
                $(this).find('form').bootstrapValidator("resetForm", true); //reset forms
                $('.modal:visible').length && $(document.body).addClass('modal-open'); //reset scrollbar setting

                if (success.twoFactorEnabled) {
                    $('#twoFA').modal('show');
                }
                else {
                    login.redirectCallingPage();
                }
                
            }
            else throw 'User info can\'t get!!';

        }).fail(function (jqXHR, textStatus) {
            alert('User login failed. Please try again.');
            $('#login').prop('disabled', false);
            $('#login').text("Login");
        });
    },

    verifyToken: function () {
        var tempToken, tempUser;

        //Store into temp
        if (localStorage.getItem('currentToken')) tempToken = localStorage.getItem('currentToken').toString();
        else if ($.cookie('currentToken')) tempToken = $.cookie('currentToken');

        if (localStorage.getItem('currentUser')) tempUser = localStorage.getItem('currentUser').toString();
        else if ($.cookie('currentUser')) tempUser = $.cookie('currentUser');

        //Clear Token and user info
        if (localStorage.getItem('currentToken')) localStorage.removeItem('currentToken')
        if ($.cookie('currentToken')) $.removeCookie('currentToken');

        if (localStorage.getItem('currentUser')) localStorage.removeItem('currentUser')
        if ($.cookie('currentUser')) $.removeCookie('currentUser');

        $.ajax({
            type: 'GET',
            url: Settings.WebApiUrl + '/api/GoogleAuthenticator/Verify/' + $('#googleToken').val(),
            async: false
        }).done(function (data) {
                //2FA success and store cookies back
                try {
                    $.cookie(login.tokenKey, tempToken);
                } catch (e) {
                    console.assert(e.message);
                }
                localStorage.setItem(login.tokenKey, tempToken);

                try {
                    $.cookie(login.userKey, tempUser);
                } catch (e) {
                    console.assert(e.message);
                }
                localStorage.setItem(login.userKey, tempUser);

                login.redirectCallingPage();
        }).fail(function (jqXHR, textStatus) {
            alert('Invalid Token. Please try again.');
            $('#googleToken').val('');
            $('#googleToken').focus();
        });
    },

    redirectCallingPage: function () {
        var params = Util.parse_query_string(window.location.search.substring(1));
        if (params && params.callbackurl) {
            window.location = params.callbackurl;
        }
        else {
            window.location = '/';
        }
    },

    getCurrentUserInfo: function (token) {
        var success = null;
        if (!token) {
            if (localStorage.getItem(login.tokenKey)) token = localStorage.getItem(login.tokenKey).access_token.toString();
            else if ($.cookie(login.tokenKey)) token = $.cookie(login.tokenKey).access_token;
        }

        if (token) {
            /* Has toekn but no current user */

            $.ajax({
                type: "POST",
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                url: Settings.WebApiUrl + '/api/User/GetCurrentUser',
                //data: Settings.ClientData,
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    try {
                        $.cookie(login.userKey, JSON.stringify(data));
                    } catch (e) {
                        console.assert(e.message);
                    }
                    localStorage.setItem(login.userKey, JSON.stringify(data));
                    success = data;
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    console.assert(jqXhr.responseText);
                    success = null;
                }
            });
        }
        return success;
    }
}