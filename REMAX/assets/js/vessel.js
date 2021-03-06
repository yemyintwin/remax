﻿var token;

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
        Util.displayLoading(document.body, true); //show loading
        setTimeout(function () {
            vessel.retrieveVessels();
        }, 100);
        
    },

    retrieveVessels: function () {
        $.ajax({
            type: 'GET',
            url: Settings.WebApiUrl + '/api/KendoVessels',
            dataType: 'json',
            async: false, // Do not user async
            //data: Settings.ClientData,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: function (result) {
                vessel.formatHtml(result);
            }
        });
    },

    formatHtml: function (result) {
        var panelRoot = $('#accordionPanel'); // accordion root element

        var divTemplate =
            '<div class="panel panel-default">' +
            '   <div class="panel-heading" id="heading{{id}}">' +
            '       <h5 class=\'panel-title\'>' +
            '           <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapse{{id}}" aria-expanded="false" aria-controls="collapseTwo">' +
            '               {{imO_No}} - {{vesselName}}' +
            '               </button>' +
            '       </h5>' +
            '   </div>' +
            '   <div id="collapse{{id}}" class="collapse" aria-labelledby="heading{{id}}" data-parent="#accordionPanel" role=\'tabpanel\'>' +
            '       <div class="panel-body">' + // Panel body starts
            '           <div class="row">' +  // Vesssel Display Row
            '               <div class=\'col-lg-6 col-md-6 ymw-v-middle\'>' +
            '                   <div style=\'ymw-v-middle\'>' +
            '                       <dl class=\'dl-horizontal\'>' +
            '                           <dt>IMO</dt>' +
            '                           <dd>{{imO_No}}</dd>' +
            '                           <dt>Ship Type</dt>' +
            '                           <dd>{{shipTypeName}}</dd>' +
            '                           <dt>Ship Class</dt>' +
            '                           <dd>{{shipClassName}}</dd>' +
            '                           <dt>Shipyard</dt>' +
            '                           <dd>{{shipyardName}}</dd>' +
            '                           <dt>Shipyard Country</dt>' +
            '                           <dd>{{shipyardCountry}}</dd>' +
            '                           <dt>Build Year</dt>' +
            '                           <dd>{{buildYear}}</dd>' +
            '                           <dt>Owner</dt>' +
            '                           <dd>{{ownerAccountName}}</dd>' +
            '                           <dt>Operator</dt>' +
            '                           <dd>{{operatorAccountName}}</dd>' +
            '                           </dl>' +
            '                   </div>' +
            '               </div>' +
            '               <div class=\'col-md-6 col-sm-12 col-xs-12\'>' +
            '                       <div><img src=\'{{image}}\' class=\'img-responsive shadow-depth-2\' style=\'max-width:100%\'></div>' +
            '               </div>' +
            '           </div>' +
            '           <div class="row" style="height:20px;"></div>' + // Seperator Row
            '           <div class="row" id="engines_msg_{{imO_No}}">' +    // Message area (i.e. Error Message)
            '           </div>' +
            '           <div class="row" style="height:20px;"></div>' + // Seperator Row
            '           <div class="row">' +
            '               <div class="col-md-12"><h4>Engines</h4></div>' + // Engines Label
            '           </div>' +
            '           <div class="row" id="engines_{{imO_No}}">' +    // Engines Row Starts
            '           </div>' +
            '           <div class="row" style="height:20px;"></div>' + // Seperator Row
            '           <div class="row">' +
            '               <div class="col-md-12"><h4>Generator</h4></div>' + // Generator Label
            '           </div>' +
            '           <div class="row" id="generators_{{imO_No}}">' +    // Generator Row Starts
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '</div>';

        var divTemplateEngine =
            '               <div class="col-lg-2 col-md-3 col-sm-6 col-xs-6">' +
            '                   <div class="thumbnail">' +
            '                       <img src="{{engineImage}}">' +
            '                       <div class="caption">' +
            '                           <h5>{{serialNo}}<br></h5>' +
            '                           <p>{{status}}</p>' +
            '                           <a href="engine.html?engine={{id}}">' +
            '                              <button class="btn btn-default btn-primary" type="button">View Details</button>' +
            '                           </a>' +
            '                       </div>' +
            '                   </div>' +
            '               </div>';
        $.each(result.data, function (index) {
            var vesObj = result.data[index];

            var divHtml = divTemplate;

            divHtml = divHtml.replace(/{{index}}/g, (index+1));
            divHtml = divHtml.replace(/{{id}}/g, vesObj.id);
            divHtml = divHtml.replace(/{{imO_No}}/g, (vesObj.imO_No ? vesObj.imO_No : ""));
            divHtml = divHtml.replace(/{{vesselName}}/g, (vesObj.vesselName ? vesObj.vesselName.toUpperCase() :""));
            divHtml = divHtml.replace(/{{shipTypeName}}/g, (vesObj.shipTypeName ? vesObj.shipTypeName : ""));
            divHtml = divHtml.replace(/{{shipClassName}}/g, (vesObj.shipClassName ? vesObj.shipClassName:""));
            divHtml = divHtml.replace(/{{shipyardName}}/g, (vesObj.shipyardName ? vesObj.shipyardName:""));
            divHtml = divHtml.replace(/{{shipyardCountry}}/g, (vesObj.countryName ? vesObj.countryName:""));
            divHtml = divHtml.replace(/{{buildYear}}/g, (vesObj.buildYear ? new Date(vesObj.buildYear).getFullYear() :""));
            divHtml = divHtml.replace(/{{ownerAccountName}}/g, (vesObj.ownerAccountName ? vesObj.ownerAccountName : ""));
            divHtml = divHtml.replace(/{{operatorAccountName}}/g, (vesObj.operatorAccountName ? vesObj.operatorAccountName : ""));

            $.ajax({
                url: Settings.WebApiUrl + "/api/KendoVessels/GetPhoto?fileName=" + vesObj.id,
                async: false, // Do not user async
                success: function (imageData) {
                    if (!imageData || imageData == "data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=")
                        imageData = "assets/img/icons8-water-transportation-256.png";

                    divHtml = divHtml.replace(/{{image}}/g, imageData);
                }
            });

            $(divHtml).appendTo(panelRoot);

            // Populating Engines 
            var msgRoot = $('#engines_msg_' + vesObj.imO_No); // Message area
            var engineRoot = $('#engines_' + vesObj.imO_No); // Engines display root div
            var generatorRoot = $('#generators_' + vesObj.imO_No); // Generators display root div

            $.each(vesObj.engines, function (index) {
                var vesEng = vesObj.engines[index];

                var divHtmlEngine = divTemplateEngine;

                divHtmlEngine = divHtmlEngine.replace(/{{id}}/g, vesEng.id);
                divHtmlEngine = divHtmlEngine.replace(/{{serialNo}}/g, vesEng.serialNo);
                divHtmlEngine = divHtmlEngine.replace(/{{status}}/g, "Running");
                $.ajax({
                    url: Settings.WebApiUrl + "/api/KendoEngines/GetPhoto?fileName=" + vesEng.id,
                    async: false,
                    success: function (imageData) {
                        //checking blank image
                        if (!imageData || imageData == "data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=")
                            imageData = "assets/img/icons8-engine-75.png";

                        divHtmlEngine = divHtmlEngine.replace(/{{engineImage}}/g, imageData);
                    }
                });

                if (vesEng && vesEng.engineType && vesEng.engineType.name) {
                    if (vesEng.engineType.name == "Engine") {
                        $(divHtmlEngine).appendTo(engineRoot);
                    }
                    else if (vesEng.engineType.name == "Generator") {
                        $(divHtmlEngine).appendTo(generatorRoot);
                    }
                }
                else {
                    var msg = '<div class="col-lg-2 col-md-3 col-sm-6 col-xs-6"><p>Define engine type under registration. Engine serial number : <strong>'
                        + vesEng.serialNo + '</strong>.</p></div>';
                    $(msg).appendTo(msgRoot);
                }
            });
        });

        Util.displayLoading(document.body, false); //hide loading
    }
}