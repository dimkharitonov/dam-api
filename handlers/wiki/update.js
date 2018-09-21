import * as dynamoDbLib from '../../libs/dynamodb-lib';
import { success, failure } from '../../libs/response-lib';

export async function main(event, context, callback) {
  const [ articleLocale, ...articleID ] = event.pathParameters.article.split('/');
  const {
    articleTitle,
    articleType,
    articleCategory,
    articleLocation,
    articleTag,
    articleStatus
  } = JSON.parse(event.body);


  const params = {
    TableName: process.env.wikiTableName,
    Key: {
      articleLocale,
      articleID: articleID.join('/')
    },

    UpdateExpression: "SET articleTitle = :articleTitle, articleType = :articleType, articleCategory = :articleCategory, articleLocation = :articleLocation, articleTag = :articleTag, articleStatus = :articleStatus",
    ExpressionAttributeValues: {
      ":articleTitle": articleTitle || null,
      ":articleType": articleType || null,
      ":articleCategory": articleCategory || null,
      ":articleLocation": articleLocation || null,
      ":articleTag": articleTag || null,
      ":articleStatus": articleStatus || 'new'
    },
    ReturnValues: "ALL_NEW"
  };

  console.log("params ", params);

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log('error', e);
    callback(null, failure({ status: false }));
  }
}