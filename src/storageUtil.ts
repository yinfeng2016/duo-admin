import {Aws} from 'aws-cli-js';

class StorageUtil {

	public async getAWSKey() {
		const aws = new Aws();
		return aws.command('ssm get-parameter --name price-feed-private --with-decryption');
	}
}

const storageUtil = new StorageUtil();
export default storageUtil;
