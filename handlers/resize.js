import { success, failure } from "../libs/response-lib";
import * as s3lib from "../libs/s3-lib";
import { getFileTypeAndName } from '../libs/file-type-name-lib';
const gm = require('gm')
  .subClass({ imageMagick: true }); // Enable ImageMagick integration.

export async function main(event, context, callback) {
  const bucketPrefix = 'public';
  const { dimensions } = event.body ? JSON.parse(event.body) : {};
  const clearDimensions = Array.isArray(dimensions) ? dimensions.filter(e => Number.isInteger(e)).map(e => Number(e)) : [ 160 ];
  const { fileType, fileName } = getFileTypeAndName(event.pathParameters.fileName);

  const params = {
    Bucket: process.env.assetsBucketName,
    Key: getFileName(bucketPrefix, fileType, fileName)
  };

  try {
    const { ContentLength, ContentType, Body } = await s3lib.call("getObject", params);

    if(appropriateFile(ContentLength, ContentType)) {

      const { width, height } = await getImageSize(Body);
      const maxOriginDimension = Math.max(width, height);
      const imageType = getImageType(ContentType);

      for(let i=0; i< clearDimensions.length; i++) {
        const scale = getScaleFactor(maxOriginDimension, clearDimensions[i]);
        uploadImage(
          await resizeImage(
            Body,
            imageType,
            width * scale,
            height * scale
          ),
          getFileName(bucketPrefix, 'thumbnails', clearDimensions[i], fileName),
          ContentType
        );
      }

      callback(null, success({ status: true }));

    } else {
      callback(null, failure({ status: false, error: "Wrong file type" }));
    }

  } catch (e) {
    if(e.code === 'NoSuchKey') {
      callback(null, failure({ status: false, error: e.message }));
    } else {
      console.log(e);
      callback(null, failure({ status: false }));
    }
  }
}

function appropriateFile(length, type) {
  return length > 0 && isRasterImage(type)
}

function isRasterImage(type) {
  const [category, extension] = type.split('/');
  return category === 'image' && [
    'jpeg',
    'jpg',
    'png'
  ].reduce(
    (result, value) => result || value === extension.toLowerCase(),
    false
  )
}

function getImageSize(image) {
  return new Promise((resolve, reject) => {
    gm(image).size((err, size) => {
      if(err) {
        console.log('Error while getting image size', err);
        reject(err);
      } else {
        resolve(size);
      }
    })
  });
}

function getScaleFactor(originSize, newSize) {
  return newSize / originSize;
}

function getImageType(contentType) {
  return contentType.split('/').reverse()[0];
}

function getFileName(...args) {
  return args.join('/');
}

function resizeImage(image, type, width, height) {
  return new Promise(
    (resolve, reject) => {
      gm(image).resize(width, height).toBuffer(type, (err, buffer) => {
        if(err) {
        console.log('Error when resizing', err);
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}

async function uploadImage(body, fileName, contentType) {
  const params = {
    Bucket: process.env.assetsBucketName,
    Key: fileName,
    Body: body,
    ContentType: contentType
  };

  return await s3lib.call("putObject", params);
}