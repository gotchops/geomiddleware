// dependencies
var request = require("koa-request");
var externalip = require("externalip");

// constants used in this file
const GEO_SERVICE = "http://ip-api.com/json/";
const OPEN_WEATHER_API_KEY = "251c4c6f9fb9f5ead5bbfcb6725956d4";
const OPEN_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?";

// Fetch and store geolocation of request's IP address.
// Fetch and store weather information based on that geolocation.
// Call the next middleware.
var geoMiddleware = function* (next) {
    // IP's geolocation (if localhost or private IP, use public IP)
    var ip = this.request.ip;

    if (ip.includes("127.0.0.1") || ip.includes("::1") || ip.includes("192.168")) {
        ip = yield externalip;
    }

    var url = GEO_SERVICE + ip;
    var geoOptions = {
        url: GEO_SERVICE + ip
    };
    var geoRes = yield request(geoOptions);
    var  geoInfo = JSON.parse(geoRes.body);
    if (geoInfo === undefined || geoInfo.status === "fail") {
        throw new Error("Could not get geolocation of IP address.");
    }
    
    _storeGeolocation(this, geoInfo);
    
    // weather info based on geolocation
    var weatherUrl = OPEN_WEATHER_URL + "lat=" + this.lat + "&" + "lon=" +
                     this.lon + "&" + "APPID=" + OPEN_WEATHER_API_KEY;
    var weatherOptions = {
        url: weatherUrl
    };
    var weatherRes = yield request(weatherOptions);
    var weatherInfo = JSON.parse(weatherRes.body);
    if (weatherInfo === undefined) {
        throw new Error("Could not get weather data.");
    }
    
    _storeWeatherInfo(this, weatherInfo);
    
    // go to next middleware
    yield next;
}

// helper to store latitude and longitude
function _storeGeolocation(context, info) {
    context.lat = info.lat;
    context.lon = info.lon;
}

// helper to store temperature and weather code
function _storeWeatherInfo(context, info) {
    context.temp = info.main.temp;
    context.weatherCode = info.weather[0].main;
}

module.exports = geoMiddleware;
