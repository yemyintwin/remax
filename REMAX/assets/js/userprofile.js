var token;

var userprofile = {
    onload: function () {
        //get current token;
        if (!token) {
            //if (localStorage.getItem(Settings.TokenKey)) token = localStorage.getItem(Settings.TokenKey).toString();
            //else if ($.cookie(Settings.TokenKey)) token = $.cookie(Settings.TokenKey);

            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
        }

        // showing current user name
        userprofile.getCurrentUser();
        $('#userNameHeading').html(Settings.CurrentUser.fullName);

        // resetting for all modal dialogs
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(this).find('form').bootstrapValidator("resetForm", true);
        });

        // attaching submit event 
        userprofile.SubmitUser();
    },

    getCurrentUser: function () {
        var url = "/api/DropDown/";
        var dropdownlist =
            [
                {
                    ctrl: 'userParent',
                    method: 'ListAllAccounts'
                },
                {
                    ctrl: 'userCountry',
                    method: 'ListAllCountry'
                }
            ];

        // Populate dropdown with list of accounts
        for (var i = 0; i < dropdownlist.length; i++) {
            var drop = $('#' + dropdownlist[i].ctrl);
            drop.empty();
            url = Settings.WebApiUrl + "/api/DropDown/" + dropdownlist[i].method;
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (data) {
                    //Process data retrieved
                    $.each(data, function (key, entry) {
                        drop.append($('<option></option>').attr('value', entry.id).text(entry.name));
                    });
                }
            });
        }

        var url = Settings.WebApiUrl + '/api/User/GetCurrentUser' ;
        if (Settings.CurrentUser) {
            $.ajax({
                type: 'GET',
                url: url,
                contentType: "application/json",
                data: null,
                dataType: 'json',
                // passing token
                //data: Settings.ClientData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'bearer ' + token);
                },
                success: function (d, textStatus, xhr) {
                    $('#id').val(d.id);
                    $('#userName').val(d.fullName);
                    $('#userParent').val(d.account.id);
                    $('#userTitle').val(d.jobTitle);
                    $('#userPhone').val(d.businessPhoneNumber);
                    $('#userMobile').val(d.phoneNumber);
                    $('#userEmail').val(d.email);
                    $('#userCountry').val(d.country);
                },
                error: function (xhr, textStatus, errorThrown) {
                    $('#errors').html('');
                    $('#errors').append(xhr.responseText);
                    $('#messageModal').modal('show');
                }
            });
        }
    },

    SubmitUser: function () {
        // validation
        $('#form_userprofile').bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            excluded: ':disabled',
            fields: {
                userName: {
                    validators: {
                        notEmpty: {
                            message: 'The user name is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The user name must be less than 100 characters long'
                        }
                    }
                },
                userParent: {
                    validators: {
                        notEmpty: {
                            message: 'The parent account (company) is required'
                        },
                    }
                },
                userTitle: {
                    validators: {
                        notEmpty: {
                            message: 'The job title is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'The job title must be less than 100 characters long'
                        }
                    }
                },
                userPhone: {
                    validators: {
                        notEmpty: {
                            message: 'Office phone number is required'
                        },
                        stringLength: {
                            max: 20,
                            message: 'Office phone number must be less than 20 characters long'
                        }
                    }
                },
                userMobile: {
                    validators: {
                        notEmpty: {
                            message: 'Mobile phone number is required'
                        },
                        stringLength: {
                            max: 20,
                            message: 'Mobile phone number must be less than 20 characters long'
                        }
                    }
                },
                userEmail: {
                    validators: {
                        notEmpty: {
                            message: 'Email is required'
                        }
                    }
                }
            }
        })
            .on('success.form.bv', function (e) {
                // Prevent form submission
                e.preventDefault();

                // data preparation
                var id = $('#id').val();
                var url = Settings.WebApiUrl + '/api/KendoUsers/' + id;
                var data = {
                    id: id,
                    fullName: $('#userName').val(),
                    accountID: $('#userParent').val(),
                    jobTitle: $('#userTitle').val(),
                    businessPhoneNumber: $('#userPhone').val(), 
                    phoneNumber: $('#userMobile').val(),
                    email: $('#userEmail').val(),
                    country: $('#userCountry').val(),
                };

                $.ajax({
                    type: 'PUT',
                    url: url,
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    dataType: 'json',
                    // passing token
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + token);
                    },
                    success: function (d, textStatus, xhr) {
                        alert("User profile changes completed.");
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $('#errors').html('');
                        $('#errors').append(xhr.responseText);
                        $('#messageModal').modal('show');
                        $("#btnUserSubmit").prop("disabled", false);
                    }
                });
            });
    },

    btnReset_OnClick: function () {
        userprofile.onload();
    },

    btnChangePassword_OnClick: function () {
        var oldPwd = $('#oldPassword').val();
        var newPwd = $('#newPassword').val();
        var retypePwd = $('#retypePassword').val();
        var id = $('#id').val();
        var url = Settings.WebApiUrl + '/api/User/UserPasswordChange';

        if (newPwd != retypePwd) { 
            alert("New password and retype password are not same.");
            $("#newPassword").focus(function () { $(this).select(); });
            return;
        }

        var data = {
            Id: id,
            OldPwd: oldPwd,
            NewPwd: newPwd
        };

        $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: 'json',
            // passing token
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: function (d, textStatus, xhr) {
                alert("Password successfully changed. Please login again with new password.");
                document.location = "/login.html?callbackurl=" + window.location.href;
            },
            error: function (xhr, textStatus, errorThrown) {
                var status = JSON.parse(xhr.responseText);
                $('#errors').html('');
                if (Settings.MessageLevel == 'info')
                    $('#errors').append(status.exceptionMessage);
                else
                    $('#errors').append(xhr.responseText);
                $('#messageModal').modal('show');
                $("#btnUserSubmit").prop("disabled", false);
            }
        });
    },
}