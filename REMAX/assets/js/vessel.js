var token;

var vessel = {
    pageSettings: {
        url: Settings.WebApiUrl + '/api/KendoVessels',
    },

    onload: function () {
        if (!token) {
            if (Settings.Token && Settings.Token.access_token) {
                token = Settings.Token.access_token;
            }
        }

        vessel.retrieveVessels();
    },

    retrieveVessels: function () {
        $.ajax({
            type: 'GET',
            url: vessel.pageSettings.url,
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: vessel.formatHtml
        });
    },

    formatHtml : function (data) {
        
    }
}