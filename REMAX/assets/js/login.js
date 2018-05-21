var login = {
    tokenKey: 'currentToken',
    userKey: 'currentUser',

    performLogin: function () {
        localStorage.removeItem(login.tokenKey); 
        localStorage.removeItem(login.userKey); 

        try { $.cookie.removeItem(login.tokenKey); } catch (e) { console.log(e.message); }
        try { $.cookie.removeItem(login.userKey); } catch (e) { console.log(e.message); }
       

        var loginData = {
            grant_type: 'password',
            username: $('#email').val(),
            password: $('#password').val()
        };

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

            if (data) {
                var now = new Date();
                data.expires_in_date = new Date(now.setSeconds(now.getSeconds() + data.expires_in));
                data.remember_me = $('#remember').prop('checked');
            }

            if ($('#remember').prop('checked') && $('#remember').prop('checked') === 'true') {
                $.cookie(login.tokenKey, JSON.stringify(data));
            }
            else {
                localStorage.setItem(login.tokenKey, JSON.stringify(data));
            }
            var success = login.getCurrentUserInfo(data.access_token);
            if (success) {
                var params = Util.parse_query_string(window.location.search.substring(1));
                if (params && params.callbackurl) {
                    window.location = params.callbackurl;
                }
                else {
                    window.location = '/';
                }
            }
            else throw 'User info can\'t get!!';

        }).fail(function () {
            alert('User login failed. Please try again.');
            $('#login').prop('disabled', false);
            $('#login').text("Login");
        });
    },

    getCurrentUserInfo: function (token) {
        var success = false;
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
                data: '{}',
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    if ($('#remember').prop('checked')) {
                        $.cookie(login.userKey, JSON.stringify(data));
                    }
                    else {
                        localStorage.setItem(login.userKey, JSON.stringify(data));
                    }
                    success = true;
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    success = false;
                }
            });
        }
        return success;
    }
}