import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { getFileTypeAndName } from '../libs/file-type-name-lib';

export async function main(event, context, callback) {
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "fileType = :fileType",
    ExpressionAttributeValues: {
      ":fileType": getFileTypeAndName(event.pathParameters.fileType).fileType
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    callback(null, success(result.Items));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}