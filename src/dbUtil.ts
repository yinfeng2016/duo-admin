import awsUtil from './database/awsUtil';
import sqlUtil from './database/sqlUtil';
import { IPrice, ITrade } from './types';

export class DbUtil {
	private aws: boolean = false;
	private live: boolean = false;

	public init(useAWS: boolean, live: boolean, user: string, pwd: string) {
		this.aws = useAWS;
		this.live = live;
		this.aws ? awsUtil.init() : sqlUtil.init(user, pwd);
	}

	public insertSourceData(sourceData: ITrade) {
		return this.aws
			? awsUtil.insertSourceData(this.live, sourceData)
			: sqlUtil.insertSourceData(this.live, sourceData);
	}

	public insertPrice(price: IPrice) {
		return this.aws ? Promise.reject('invalid') : sqlUtil.insertPrice(price);
	}

	public readLastPrice(): Promise<IPrice> {
		return this.aws ? Promise.reject('invalid') : sqlUtil.readLastPrice();
	}

	public async readSourceData(currentTimestamp: number): Promise<ITrade[]> {
		return this.aws ? Promise.reject('invalid') : sqlUtil.readSourceData(currentTimestamp);
	}
}

const dbUtil = new DbUtil();
export default dbUtil;
