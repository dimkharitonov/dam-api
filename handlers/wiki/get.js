import * as dynamoDbLib from '../../libs/dynamodb-lib';
import { success, failure } from '../../libs/response-lib';

export async function main(event, context, callback) {
  const [ articleLocale, ...articleID ] = event.pathParameters.article.split('/');

  const params = {
    TableName: process.env.wikiTableName,
    Key: {
      articleLocale,
      articleID: articleID.join('/')
    }
  };

  console.log(params);

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // Return the retrieved item
      callback(null, success(result.Item));
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
    }
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}