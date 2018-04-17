"use strict";
exports.__esModule = true;
var Web3 = require('web3');
var rp = require('request-promise');
var Tx = require('ethereumjs-tx');
var es6_promise_1 = require("es6-promise");
// const provider = 'https://mainnet.infura.io/Ky03pelFIxoZdAUsr82w';
var provider = 'https://kovan.infura.io/WSDscoNUvMiL1M7TvMNP ';
// const provider = 'http://localhost:8545';
var web3 = new Web3(new Web3.providers.HttpProvider(provider));
var CustodianABI = require('./ABI/Custodian.json'); //Custodian Contract ABI
var addressCustodianContract = '0x8bf0bee757bbab37a8eb55fa6befb63437a3bb1b';
var custodianContract = new web3.eth.Contract(CustodianABI['abi'], addressCustodianContract);
var pfAddress = '0x0022BFd6AFaD3408A1714fa8F9371ad5Ce8A0F1a';
var privateKey = "5e02a6a6b05fe971309cba0d0bd8f5e85f25e581d18f89eb0b6da753d18aa285";
var gas_price = 100 * Math.pow(10, 9);
var gas_limit = 6000000;
var ETH_PRICE_LINK = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD';
var priceFeedInterval = 60 * 60 * 1000;
var PriceFeed1 = /** @class */ (function () {
    function PriceFeed1() {
    }
    PriceFeed1.prototype.getETHprice = function (url) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            return rp({
                url: url,
                headers: {
                    'user-agent': 'node.js'
                }
            }, function (error, res, body) {
                if (error)
                    reject(error);
                else if (res.statusCode === 200)
                    resolve(body);
                else
                    reject('Error status ' + res.statusCode + ' ' + res.statusMessage);
            });
        });
    };
    PriceFeed1.prototype.generateTxStrng = function (priceInWei, priceInSeconds) {
        var res = web3.eth.abi.encodeFunctionCall({
            name: 'commitPrice',
            type: 'function',
            inputs: [
                {
                    "name": "priceInWei",
                    "type": "uint256"
                },
                {
                    "name": "priceInSeconds",
                    "type": "uint256"
                }
            ]
        }, [priceInWei, priceInSeconds]);
        return res;
    };
    PriceFeed1.prototype.create_tx_command = function (nonce, gas_price, gas_limit, to_address, amount, data) {
        var rawTx = {
            nonce: nonce,
            gasPrice: web3.utils.toHex(gas_price),
            gasLimit: web3.utils.toHex(gas_limit),
            to: to_address,
            value: web3.utils.toHex(web3.utils.toWei(amount.toString())),
            data: data
        };
        return rawTx;
    };
    PriceFeed1.prototype.sign_tx = function (rawTx, private_key) {
        try {
            var tx = new Tx(rawTx);
            var private_key_hex = new Buffer(private_key, 'hex');
            tx.sign(private_key_hex);
        }
        catch (err) {
            console.log(err);
            return;
        }
        var serializedTx = tx.serialize().toString('hex');
        return serializedTx;
    };
    PriceFeed1.prototype.startFeeding = function () {
        var _this = this;
        var priceInWei;
        var priceInSeconds;
        var commitFunc = function () {
            _this.getETHprice(ETH_PRICE_LINK)
                .then(function (res) {
                var data = JSON.parse(res);
                priceInWei = data['USD'];
                priceInSeconds = (new Date().getTime() / 1000).toFixed(0);
                // console.log(priceInWei);
                // console.log(priceInSeconds);
            })
                .then(function () {
                console.log('starting committing price');
                web3.eth.getTransactionCount(pfAddress).then(function (nonce) {
                    console.log(nonce);
                    var command = _this.generateTxStrng(priceInWei, priceInSeconds);
                    var rawTx = _this.create_tx_command(nonce, gas_price, gas_limit, addressCustodianContract, 0, command);
                    var transactionMSG = _this.sign_tx(rawTx, privateKey);
                    // sending out transaction
                    web3.eth.sendSignedTransaction('0x' + transactionMSG).on('receipt', console.log);
                });
            });
        };
        commitFunc();
        setInterval(commitFunc, priceFeedInterval);
    };
    return PriceFeed1;
}());
var pf1 = new PriceFeed1();
exports["default"] = pf1;
