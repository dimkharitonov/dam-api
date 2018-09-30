import * as dynamoDbLib from '../../libs/dynamodb-lib';
import { success, failure } from '../../libs/response-lib';

export async function main(event, context, callback) {
  const { locale } = event.body ? JSON.parse(event.body) : {};
  const condition = locale && typeof locale === 'string' && locale.length === 2
    ? {
        KeyConditionExpression: "articleLocale = :locale",
        ExpressionAttributeValues: {
          ":locale": locale
        }
      }
    : {};

  const params = {
    TableName: process.env.wikiTableName,
    ...condition
  };

  try {
    const action = locale && typeof locale === 'string' && locale.length === 2
      ? 'query'
      : 'scan';
    const result = await dynamoDbLib.call(action, params);
    // Return the matching list of items in response body
    callback(null, success(result.Items));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}