import {Aws} from 'aws-cli-js';

class StorageUtil {

	public async getAWSKey() {
		const aws = new Aws();
		return aws.command('ssm get-parameter --name price-feed-private --region ap-southeast-1 --with-decryption');
	}
}

const storageUtil = new StorageUtil();
export default storageUtil;
