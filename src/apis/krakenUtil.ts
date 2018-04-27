import sqlUtil from '../sqlUtil';
import * as CST from '../constants';
import util from '../util';
import { Trade } from '../types';

const INTERVAL_SECS = 5;

let last = 0; // last = id to be used as since when polling for new trade data

export class KrakenUtil {
	parseTrade(trade: object): Trade {
		let trade_type: string = 'buy';
		const exchange_returned_timestamp = Math.floor(Number(trade[2]) * 1000) + '';

		if (trade[3] == 'b') {
			trade_type = 'buy';
		} else if (trade[3] == 's') {
			trade_type = 'sell';
		}

		return {
			source: CST.EXCHANGE_KRAKEN,
			tradeId: exchange_returned_timestamp,
			price: trade[0],
			amount: trade[1],
			tradeType: trade_type,
			sourceTimestamp: exchange_returned_timestamp
		};
	}

	parseApiResponse(response: string) {
		const jsonObj = JSON.parse(response);

			const returnFirstLevelArray = jsonObj['result']['XETHZUSD'];
			// console.log(url);
			returnFirstLevelArray.forEach(trade => {
				console.log(trade);
				const parsedTrade: Trade = krakenUtil.parseTrade(trade);

				sqlUtil.insertSourceData(parsedTrade);
			});

			last = jsonObj['result']['last'];
			console.log(last);
	}

	async fetchETHTradesByOwnWebSocket() {
		// const kraken = new Kraken();
		const baseUrl: string = 'https://api.kraken.com/0/public/Trades?pair=ETHUSD';
		let url: string = '';

		if (last == 0) {
			url = baseUrl;
		} else if (last != undefined) {
			url = baseUrl + '&last=' + last + '';
		}
		console.log('request: ' + last + ' length: ' + last.toString().split('.')[0].length);

		try {
			const response: any = await util.get(url);
			this.parseApiResponse(response.toString());
		} catch (error) {
			console.log(error);
		}
	}

	startFetching() {
		setInterval(() => this.fetchETHTradesByOwnWebSocket(), INTERVAL_SECS * 1000);
	}
}
const krakenUtil = new KrakenUtil();
export default krakenUtil;
