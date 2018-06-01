import bitfinexUtil from './apis/bitfinexUtil';
import gdaxUtil from './apis/gdaxUtil';
import geminiUtil from './apis/geminiUtil';
import krakenUtil from './apis/krakenUtil';
import ContractUtil from './contractUtil';
import dynamoUtil from './database/dynamoUtil';
import sqlUtil from './database/sqlUtil';
import dbUtil from './dbUtil';
import eventUtil from './eventUtil';
import ohlcUtil from './ohlcUtil';
import util from './util';

const tool = process.argv[2];
util.log('tool ' + tool);
const option = util.parseOptions(process.argv);
util.log('using ' + (option.live ? 'live' : 'dev') + ' env and ' + (option.source || 'local node'));
const contractUtil = new ContractUtil(option);
dbUtil.init(option.dynamo);
dynamoUtil.init(
	option.live,
	util.getDynamoRole(tool, option.dynamo),
	util.getStatusProcess(tool, option)
);
if (['bitfinex', 'gemini', 'kraken', 'gdax', 'commit'].includes(tool) && !option.dynamo) {
	const mysqlAuthFile = require('./keys/mysql.json');
	sqlUtil.init(mysqlAuthFile.host, mysqlAuthFile.user, mysqlAuthFile.password);
}

switch (tool) {
	case 'bitfinex':
		util.log('starting fetchTrade of bitfinex');
		bitfinexUtil.fetchTrades();
		break;
	case 'gemini':
		util.log('starting fetchTrade of gemini');
		geminiUtil.fetchTrades();
		break;
	case 'kraken':
		util.log('starting fetchTrade of kraken');
		krakenUtil.startFetching();
		break;
	case 'gdax':
		util.log('starting fetchTrade of gdax');
		gdaxUtil.startFetching();
		break;
	case 'subscribe':
		eventUtil.subscribe(contractUtil, option);
		setInterval(() => dynamoUtil.insertHeartbeat(), 30000);
		break;
	case 'commit':
		util.log('starting commit process');
		contractUtil.commitPrice(option);
		break;
	case 'minutely':
		ohlcUtil.startProcessMinute();
		setInterval(() => dynamoUtil.insertHeartbeat(), 30000);
		break;
	case 'hourly':
		ohlcUtil.startProcessHour();
		setInterval(() => dynamoUtil.insertHeartbeat(), 30000);
		break;
	case 'node':
		util.log('starting node hear beat');
		setInterval(
			() =>
				contractUtil.getCurrentBlock().then(bn =>
					dynamoUtil.insertStatusData({
						block: { N: bn + '' },
						timestamp: { N: util.getNowTimestamp() + '' }
					})
				),
			30000
		);
		break;
	default:
		util.log('no such tool ' + tool);
		break;
}
