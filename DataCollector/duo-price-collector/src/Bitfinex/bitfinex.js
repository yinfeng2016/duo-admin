"use strict";

// var bitfinex_request = require('request');
const BASE_HOST_LINK='https://api.bitfinex.com/v1';

const price_collect_interval=2;    //2 Sec

var BitfinexCollector = /** @class */ (function () {
	function BitfinexCollector() {
	}
   
	// BitfinexCollector.prototype.getETHprice = function (url) {
	// 	return new es6_promise_1.Promise(function (resolve, reject) {
	// 		return rp({
	// 			url: url,
	// 			headers: {
	// 				'user-agent': 'node.js'
	// 			}
	// 		}, function (error, res, body) {
	// 			if (error)
	// 				reject(error);
	// 			else if (res.statusCode === 200)
	// 				resolve(body);
	// 			else
	// 				reject('Error status ' + res.statusCode + ' ' + res.statusMessage);
	// 		});
	// 	});
	// };


	BitfinexCollector.prototype.startProcess = function () {
		var _this = this;
		var FetchPriceFunc = function () {
			_this.getETHprice(BASE_HOST_LINK)
				.then(function () {
					console.log("test!");
					// console.log(priceInWei);
					// console.log(priceInSeconds);
				})
				.then(function () {
					console.log('starting insert price into the DB');
               
				});
		};
		setInterval(FetchPriceFunc, price_collect_interval);
	};
	return BitfinexCollector;
}());
var collector1 = new BitfinexCollector();
exports["default"] = collector1;
