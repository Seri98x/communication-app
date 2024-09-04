var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
    'method': 'GET',
    'hostname': 'v369qv.api.infobip.com',
    'path': '/ccaas/1/conversations/3d5927ec-f14d-4dd6-b519-bc893d969b70/messages',
    'headers': {
        'Authorization': 'App 39969d7f5ac7ec9d481bcc4230160e0e-b6985f18-96f4-4a63-a6a0-1ecd413b4cf7',
        'Accept': 'application/json'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
    });

    res.on("error", function (error) {
        console.error(error);
    });
});

req.end();