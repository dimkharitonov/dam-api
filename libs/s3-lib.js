import AWS from "aws-sdk";

AWS.config.update({ region: "eu-west-1" });


export function call(action, params) {
  const s3 = new AWS.S3();

  return s3[action](params).promise();
}