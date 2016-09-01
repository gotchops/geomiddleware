var koa = require("koa");
var geo = require("./geoMiddleware");
var app = koa();

const PORT = 8000;

app.use(geo);

app.use(function* (next) {
    try {
        var lat = "Latitude: " + this.lat + "\n";
        var lon = "Longitude: " + this.lon + "\n";
        var temp = "Temperature: " + this.temp + " K\n";
        var code = "Weather code: " + this.weatherCode + "\n";
        msg = lat + lon + temp + code;
        this.body = msg;
    } catch(err) {
        console.error(err);
    }
});

app.listen(PORT);