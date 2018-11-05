import * as dynamoDbLib from '../../libs/dynamodb-lib';
import { success, failure } from '../../libs/response-lib';

export async function main(event, context, callback) {
  const [ articleLocale, ...articleID ] = event.pathParameters.article.split('/');
  const {
    articleTitle,
    articleType,
    articleCategory,
    articleCategoryRU,
    articleLocation,
    articleTag,
    articleStatus,
    articleCreated
  } = JSON.parse(event.body);


  const params = {
    TableName: process.env.wikiTableName,
    Key: {
      articleLocale,
      articleID: articleID.join('/')
    },

    UpdateExpression: "SET articleTitle = :articleTitle, articleType = :articleType, articleCategory = :articleCategory, articleCategoryRU = :articleCategoryRU, articleLocation = :articleLocation, articleTag = :articleTag, articleStatus = :articleStatus, articleCreated = :articleCreated",
    ExpressionAttributeValues: {
      ":articleTitle": articleTitle || null,
      ":articleType": articleType || null,
      ":articleCategory": articleCategory || null,
      ":articleCategoryRU": articleCategoryRU || null,
      ":articleLocation": articleLocation || null,
      ":articleTag": articleTag || null,
      ":articleStatus": articleStatus || 'new',
      ":articleCreated": articleCreated || Date.now()
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