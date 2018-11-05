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
            articleTitle: i.articleTitle ? { S: i.articleTitle } : { NULL : true},
            articleType: i.articleType ? { S: i.articleType } : { NULL : true},
            articleCategory: i.articleCategory ? { S: i.articleCategory } : { NULL : true},
            articleCategoryRU: i.articleCategoryRU ? { S: i.articleCategoryRU } : { NULL : true},
            articleLocation: i.articleLocation ? { S: i.articleLocation } : { NULL : true},
            articleTag: i.articleTag ? { S: i.articleTag } : { NULL : true},
            articleStatus: i.articleStatus ? { S: i.articleStatus } : { NULL : true},
            articleCreated: { S: String(i.articleCreated) }
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

}