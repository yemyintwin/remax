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
            url: Settings.WebApiUrl + '/api/KendoVessels',
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: vessel.formatHtml
        });
    },

    formatHtml: function (result) {
        var panelRoot = $('#accordionPanel'); // accordion root element

        var divTemplateBak = `
            <div class='panel panel-default'>
                <div class='panel-heading' role='tab'>
                    <h4 class='panel-title'>
                        <a role='button' data-parent='#accordion-1' aria-expanded='true' href='#accordion-1.item-{{index}}'>{{imO_No}} - {{vesselName}}</a>
                    </h4>
                </div>
                <div class='panel-collapse collapse in item-{{index}}' role='tabpanel'>
                    <div class='panel-body'>
                        <div class='row'>
                            <div class='col-lg-6 col-md-6 ymw-v-middle'>
                                <div style='ymw-v-middle'>
                                    <dl class='dl-horizontal'>
                                        <dt>IMO</dt>
                                        <dd>{{imO_No}}</dd>
                                        <dt>Ship Type</dt>
                                        <dd>{{shipType.name}}</dd>
                                        <dt>Ship Class</dt>
                                        <dd>{{shipClass.name}}</dd>
                                        <dt>Shipyard</dt>
                                        <dd>{{shipyardName}}</dd>
                                        <dt>Shipyard Country</dt>
                                        <dd>{{shipyardCountry}}</dd>
                                        <dt>Build Year</dt>
                                        <dd>{{buildYear}}</dd>
                                        <dt>Owner</dt>
                                        <dd>{{ownerAccount.name}}</dd>
                                        <dt>Operator</dt>
                                        <dd>{{operatorAccount.name}}</dd>
                                    </dl>
                                </div>
                            </div>
                            <div class='col-md-6 col-sm-12 col-xs-12'>
                                <div><img src='{{image}}' class='img-responsive shadow-depth-2' style='max-width:100%'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        var divTemplate = `
            <div class="panel panel-default">
                <div class="panel-heading" id="heading{{id}}">
                  <h5 class='panel-title'>
                    <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapse{{id}}" aria-expanded="false" aria-controls="collapseTwo">
                      {{imO_No}} - {{vesselName}}
                    </button>
                  </h5>
                </div>
                <div id="collapse{{id}}" class="collapse" aria-labelledby="heading{{id}}" data-parent="#accordionPanel" role='tabpanel'>
                  <div class="panel-body">
                    <div class='col-lg-6 col-md-6 ymw-v-middle'>
                                <div style='ymw-v-middle'>
                                    <dl class='dl-horizontal'>
                                        <dt>IMO</dt>
                                        <dd>{{imO_No}}</dd>
                                        <dt>Ship Type</dt>
                                        <dd>{{shipType.name}}</dd>
                                        <dt>Ship Class</dt>
                                        <dd>{{shipClass.name}}</dd>
                                        <dt>Shipyard</dt>
                                        <dd>{{shipyardName}}</dd>
                                        <dt>Shipyard Country</dt>
                                        <dd>{{shipyardCountry}}</dd>
                                        <dt>Build Year</dt>
                                        <dd>{{buildYear}}</dd>
                                        <dt>Owner</dt>
                                        <dd>{{ownerAccount.name}}</dd>
                                        <dt>Operator</dt>
                                        <dd>{{operatorAccount.name}}</dd>
                                    </dl>
                                </div>
                            </div>
                            <div class='col-md-6 col-sm-12 col-xs-12'>
                                <div><img src='{{image}}' class='img-responsive shadow-depth-2' style='max-width:100%'></div>
                            </div>
                  </div>
                </div>
            </div>
        `;

        $.each(result.data, function (index) {
            var vesObj = result.data[index];
            var divHtml = divTemplate;

            divHtml = divHtml.replace(/{{index}}/g, (index+1));
            divHtml = divHtml.replace(/{{id}}/g, vesObj.id);
            divHtml = divHtml.replace(/{{imO_No}}/g, (vesObj.imO_No ? vesObj.imO_No : ""));
            divHtml = divHtml.replace(/{{vesselName}}/g, (vesObj.vesselName ? vesObj.vesselName:""));
            divHtml = divHtml.replace(/{{shipType.name}}/g, (vesObj.shipType && vesObj.shipType.name ? vesObj.shipType.name : ""));
            divHtml = divHtml.replace(/{{shipClass.name}}/g, (vesObj.shipClass && vesObj.shipClass.name ? vesObj.shipClass.name:""));
            divHtml = divHtml.replace(/{{shipyardName}}/g, (vesObj.shipyardName ? vesObj.shipyardName:""));
            divHtml = divHtml.replace(/{{shipyardCountry}}/g, (vesObj.country && vesObj.country.name ? vesObj.country.name:""));
            divHtml = divHtml.replace(/{{buildYear}}/g, (vesObj.buildYear ? new Date(vesObj.buildYear).getFullYear() :""));
            divHtml = divHtml.replace(/{{ownerAccount.name}}/g, (vesObj.ownerAccount && vesObj.ownerAccount.name ? vesObj.ownerAccount.name : ""));
            divHtml = divHtml.replace(/{{operatorAccount.name}}/g, (vesObj.operatorAccount && vesObj.operatorAccount.name ? vesObj.operatorAccount.name : ""));

            $.ajax({
                url: Settings.WebApiUrl + "/api/KendoVessels/GetPhoto?fileName=" + vesObj.id,
                async: false,
                success: function (imageData) {
                    divHtml = divHtml.replace(/{{image}}/g, imageData);
                }
            });

            $(divHtml).appendTo(panelRoot);
        });
    }
}