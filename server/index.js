var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
    'method': 'POST',
    'hostname': 'v369qv.api.infobip.com',
    'path': '/sms/2/text/advanced',
    'headers': {
        'Authorization': 'App 39969d7f5ac7ec9d481bcc4230160e0e-b6985f18-96f4-4a63-a6a0-1ecd413b4cf7',
        'Content-Type': 'application/json',
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

var postData = JSON.stringify({
    "messages": [
        {
            "destinations": [{"to":"639678670667"}],
            "from": "447491163443",
            "text": "Congratulations on sending your first message.\nGo ahead and check the delivery report in the next step."
        }
    ]
});

req.write(postData);

req.end();