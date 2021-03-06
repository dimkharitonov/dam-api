import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { getFileTypeAndName } from '../libs/file-type-name-lib';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Key: {
      ... getFileTypeAndName(event.pathParameters.fileName)
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET title = :title, summary = :summary, extension = :extension",
    ExpressionAttributeValues: {
      ":title": data.title ? data.title : null,
      ":summary": data.summary ? data.summary : null,
      ":extension": data.extension ? data.extension : null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}