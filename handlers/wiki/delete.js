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

  try {
    const result = await dynamoDbLib.call("delete", params);
    callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}