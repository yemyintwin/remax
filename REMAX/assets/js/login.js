var login = {
    tokenKey: 'currentToken',
    userKey: 'currentUser',

    performLogin: function () {
        localStorage.removeItem(login.tokenKey); 
        localStorage.removeItem(login.userKey); 

        try { $.cookie.removeItem(login.tokenKey); } catch (e) { }
        try { $.cookie.removeItem(login.userKey); } catch (e) { }
       

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
            if ($('#remember').prop('checked')) {
                $.cookie(login.tokenKey, data.access_token);
            }
            else {
                localStorage.setItem(login.tokenKey, data.access_token);
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
            if (localStorage.getItem(login.tokenKey)) token = localStorage.getItem(login.tokenKey).toString();
            else if ($.cookie(login.tokenKey)) token = $.cookie(login.tokenKey);
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