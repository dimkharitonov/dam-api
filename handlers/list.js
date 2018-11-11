import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { getFileTypeAndName } from '../libs/file-type-name-lib';

const getData = function(type, item=null) {
  const method = item ? 'get' : 'query';
  const params = item
  ?
    {
      TableName: process.env.tableName,
      Key: {
        "fileType": type,
        "fileName": item
      }
    }
  : {
      TableName: process.env.tableName,
      KeyConditionExpression: "fileType = :fileType",
      ExpressionAttributeValues: {
        ":fileType": type
    }
  };

  return dynamoDbLib.call(method, params);
};

export async function main(event, context, callback) {
  let { items } = event.body ? JSON.parse(event.body) : [];
  const fileType = getFileTypeAndName(event.pathParameters.fileType).fileType;

  let requests = [];

  try {

    if(Array.isArray(items) && items.length) {
      if(items.length > 50) {
        items = items.slice(0,50);
      }
      for(let i=0; i<items.length;i++) {
        requests.push(getData(fileType, items[i]));
      }
    } else {
      requests.push(getData(fileType));
    }

    const result = await Promise.all(requests);

    // Return the matching list of items in response body
    callback(null, success(result.map(i => i.Item || i.Items)));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}