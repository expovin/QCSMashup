console.log("Avvio Mashup.js");

							
// Qlik configuration
const qlikConfig =  {
    appId: '5c896407-f6cd-4026-9d99-dc72a8e482da',
    vizId1 : 'rRdQrjt',
    vizId2 : '2089c9bf-331a-4165-bb71-8eabc110390c',
    vizId3 : 'LgJaz',
    vizId4 : 'BNMZhT',
    host: 'expovin.eu.qlikcloud.com',
    webIntegrationId: 'v0dlngwTssFeoNQ3cPvDHxZuYhizD1TA',
    port: 443,
    prefix: '/',
    isSecure: true
};

console.log(qlikConfig);

// requireJS configuration, re-use Qlik configuration
require.config({
    baseUrl:  'https://' + qlikConfig.host + '/resources',
    webIntegrationId: qlikConfig.webIntegrationId
});

console.log(require)

// helper function declaration
const _deserialize = response => (response.status !== 200 ? false : response.json());

function _request(url, method = 'GET', payload = null) {
    return fetch('https://'+qlikConfig.host + url, {
        method: method,
        mode: 'cors', // cors must be enabled
        credentials: 'include', // credentials must be included
        headers: {
        'Content-Type': 'application/json',
        'qlik-web-integration-id': qlikConfig.webIntegrationId, // needed in order to whitelist your domain
        },
        body: payload
    });
}

function getUser() {
    console.log("[getUser]")
    return _request('/api/v1/users/me').then(_deserialize);
}

function getTenant() {
    console.log("[getTenant]")
    return _request('/api/v1/tenants/me').then(_deserialize);
}

function showError(error) {
    console.log('Something went wrong: ' + error.message);
    // resolve();
};

// main function
async function showViz (chartid) {

    console.log("In Async function");
    const [user, tenant] = await Promise.all([getUser(), getTenant()]);

    if (user || tenant) {
        console.log("user or tenant defined");

        // declare qli, app and showViz global so that we can call them again
        // w/o the need to reload all the stuff that comes via require!
        // add something later along the lines of
        // if (qlik is loaded) {renderViz(someChartId)} else {require 'js/qlik'}

        requirejs(['js/qlik'], function (result) {


            console.log('in require callback AppId: '+qlikConfig.appId)
            qlik = result;
            app = qlik.openApp(qlikConfig.appId, qlikConfig);

            var lastNameField = app.field('Alpha');
            console.log(lastNameField)

            app.on('error', showError);


            app.getObject('div1', qlikConfig.vizId1);
            app.getObject('div2', qlikConfig.vizId2);
            app.getObject('div3', qlikConfig.vizId3);
            app.getObject('div4', qlikConfig.vizId4);            

        }, (err) => console.log(err) )
    }
}
showViz();