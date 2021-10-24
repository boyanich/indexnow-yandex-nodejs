const fs = require("fs");
const https = require('https');
var flow = require('xml-flow');
var request = require('request');
const authKey = "Вставьте сюда свой ключ";
const host = "Сюда вставьте свой домен"

var file = fs.createWriteStream('site.xml');
let arrayOfUrlsFromSitemap = [];


https.get(`https://${host}/sitemap.xml`, function(res) {
    res.on('data', function(data) {
        file.write(data);
    }).on('end', function() {
        file.end();

        var inFile = fs.createReadStream("site.xml"),
            xmlStream = flow(inFile);

        xmlStream.on('tag:loc', function(url) {
            arrayOfUrlsFromSitemap.push(url.$text)
        });

        xmlStream.on('end', function() {
            console.log("Массив URL из карты сайта сформирован и отправляется")
            const data = {
                host: host,
                key: authKey,
                urlList: arrayOfUrlsFromSitemap
            }

            request({
                url: "https://yandex.com/indexnow",
                method: "POST",
                json: true,
                body: data
            }, function (error, response, body){
                if (response.statusCode === 200) {
                    console.log("Все ништяк");
                } else {
                    console.log("Что-то пошло не так - смотри документацию по ответам API яндекса. Код ошибки: "+ response.statusCode)
                }
            });
        });
    })
})
