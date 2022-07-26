/*
 * Basic responsive mashup template
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
var config = {
	host: 'e7ixql68q51ilev.us.qlikcloud.com',
	prefix: '/',
	port: 443,
	isSecure: window.location.protocol === "https:",
	webIntegrationId: 'xV3eqA-sz5oEoQbji7YJw1JCQ0nzqvLj'
};
//Redirect to login if user is not logged in
async function login() {
      function isLoggedIn() {
        return fetch("https://"+config.host+"/api/v1/users/me", {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'qlik-web-integration-id': config.webIntegrationId,
          },
        }).then(response => {
          return response.status === 200;
        });
      }
      return isLoggedIn().then(loggedIn => {
        if (!loggedIn) {	  
            window.location.href = "https://"+config.host+"/login?qlik-web-integration-id=" + config.webIntegrationId + "&returnto=" + location.href;
            throw new Error('not logged in');
        }
      });
    }
login().then(() => {
    require.config( {
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
    webIntegrationId: config.webIntegrationId
} );			

require( ["js/qlik"], function ( qlik ) {
	qlik.on( "error", function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		$( '#popup' ).fadeIn( 1000 );
	} );
	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );
    //open apps -- inserted here --
	var app = qlik.openApp( '8ae6d9ba-19cc-47ce-8860-e3b6e13ee123', config );
	
    //get objects -- inserted here --
	app.visualization.get('arrXTE').then(function(vis){
    vis.show("QV01");	
	} );
    	app.visualization.get('MXAQHeM').then(function(vis){
    vis.show("QV02");	
	} );
	
			//DOWNLOAD BY USING SELECT OPTIONS INSPIRED BY https://jsfiddle.net/mindspank/hozs7db4/ PER https://community.qlik.com/t5/Qlik-Sense-Integration-Extensions-APIs/Creating-a-dynamic-exportData-button-re-using-same-button-for/td-p/1284197
		$(document).ready(function() {
			//export and download starts 
			$(document).on('click', ".downloaddata", function(e) {
				var downloaddiv = $('#' + $(this).parent().parent().find('#data-download option:selected').attr('value'))[0];	
				console.log(downloaddiv);
				console.log('downloaddata');		
				var objScope = angular.element(downloaddiv.children[0]).scope();
				var objId = objScope.model.id;
				app.getObject(objId).then(function(model) { 
					var table = qlik.table(model); 
					table.exportData({
						//'format':'CSV_C','filename': 'export_limit_is_5million_cells','download': true // exports to csv; strips leading zeroes; for large datasets https://help.qlik.com/en-US/sense-developer/June2020/APIs/EngineAPI/services-GenericObject-ExportData.html
						'filename': 'chart_data','download': true // exports to excel with a limit of 1 million cells; retains leading zeros but holds less data than csv above
					}); 
				});
			 });   
		});
} );});
