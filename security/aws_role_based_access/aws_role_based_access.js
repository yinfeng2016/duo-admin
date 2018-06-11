    var awsCli = require('aws-cli-js');
    var Options = awsCli.Options;
    var Aws = awsCli.Aws;

    var aws = new Aws();

  aws.command('ssm get-parameter --name price-feed-private --with-decryption').then(function (data) {

    console.log(JSON.stringify(data.object.Parameter.Value));

  }).catch((error) => {
    console.log(error);
  });