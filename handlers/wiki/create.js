import * as dynamoDbLib from '../../libs/dynamodb-lib';
import { success, failure } from "../../libs/response-lib";

export async function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const { items }  = JSON.parse(event.body);

  if(items && Array.isArray(items) && items.length && items.length < 26) {
    let itemsSet = {};
    itemsSet[process.env.wikiTableName] = items.map(i => {
      return {
        PutRequest: {
          Item: {
            articleLocale: { S: i.articleLocale },
            articleID: { S: i.articleID },
            articleTitle: { S: i.articleTitle },
            articleType: { S: i.articleType },
            articleCategory: { S: i.articleCategory },
            articleLocation: { S: i.articleLocation },
            articleTag: { S: i.articleTag },
            articleStatus: { S: i.articleStatus }
          }
        }
      }
    });

    const params = {
      RequestItems: {
        ...itemsSet
      }
    };

    console.log('params', JSON.stringify(params));

    try {
      await dynamoDbLib.batchCall("batchWriteItem", params);
      callback(null, success(params.RequestItems));
    } catch (e) {
      console.log(e);
      callback(null, failure({ status: false }));
    }
  } else {
    callback(null, failure({ status: false }));
  }

/*



  const {
    articleLocale,
    articleID,
    articleTitle,
    articleType,
    articleCategory,
    articleLocation,
    articleTag,
    articleStatus
  } = JSON.parse(event.body);

  const params = {
    TableName: process.env.wikiTableName,
    Item: {
      articleLocale,
      articleID: articleID.trim(),
      articleTitle,
      articleType,
      articleCategory,
      articleLocation,
      articleTag,
      articleStatus,
      created: Date.now()
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
 */
}