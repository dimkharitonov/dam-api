import AWS from "aws-sdk";
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from "../libs/response-lib";
import { getFileTypeAndName } from '../libs/file-type-name-lib';


export async function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  console.log('data', data);
  console.log('table', process.env.tableName);

  const params = {
    TableName: process.env.tableName,
    Item: {
      ...data,
      ...getFileTypeAndName(data.fileName)
    }
  };

  console.log('params', params);

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }

}