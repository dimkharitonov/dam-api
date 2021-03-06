import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { getFileTypeAndName } from '../libs/file-type-name-lib';

export async function main(event, context, callback) {
  const params = {
    TableName: process.env.tableName,
    Key: {
      ... getFileTypeAndName(event.pathParameters.fileName)
    }
  };

  try {
    const result = await dynamoDbLib.call("delete", params);
    callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}