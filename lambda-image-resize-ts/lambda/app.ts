import { S3Event } from 'aws-lambda';
import sharp from "sharp";
import * as s3 from 'aws-cdk-lib/aws-s3';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const S3 = new S3Client();

exports.handler = async (event: S3Event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  // Object key may have spaces or unicode non-ASCII characters
  const srcKey = decodeURIComponent(key.replace(/\+/g, " "));

  console.log(`Bucket: ${bucket}`, `Key: ${key}`);

  try {
    
    const { Body, ContentType } = await S3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
    
    const image = await Body?.transformToByteArray();
     
    // resize image
    const outputBuffer = await sharp(image).resize(200).toBuffer();
 
    // store new image in the destination bucket
    await S3.send(
      new PutObjectCommand({
        Bucket: 'aldomatic-resized-images',
        Key: srcKey,
        Body: outputBuffer,
        ContentType,
      })
    );
    const message = `Successfully resized ${bucket}/${srcKey} and uploaded to aldomatic-resized-images/${srcKey}`;
    console.log(message);
    return {
      statusCode: 200,
      body: message,
    };
  } catch (err) {
    console.log(err)
  }
  

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: "Hello, CDK! You've hit"
  };
}