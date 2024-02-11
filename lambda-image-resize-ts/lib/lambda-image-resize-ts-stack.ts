import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from "path";
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';;

export class LambdaImageResizeTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create uncompressed bucket
  const s3BucketUncompressed = new s3.Bucket(this, 'bucketFromCDK', {
    bucketName: "aldomatic-uncompressed-images",
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    publicReadAccess: false
  });
    
  // Create resized bucket
  const s3BucketResized = new s3.Bucket(this, 'bucketResizedFromCDK', {
    bucketName: "aldomatic-resized-images",
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    publicReadAccess: false
  });
  
  
  const triggerFunction = new NodejsFunction(this, 'triggerFunction', {
    memorySize: 1024,
    timeout: cdk.Duration.seconds(5),
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: 'handler',
    entry: path.join(__dirname, `/../lambda/app.ts`),
    bundling: {
      nodeModules: ["sharp"],
      forceDockerBundling: true, // force docker bundling for sharp
    },
    environment: {
      bucketName: s3BucketUncompressed.bucketName,
    }
  });
  
  
  s3BucketUncompressed.grantRead(triggerFunction)
  
  // allow the function to upload objects to the resized bucket
  s3BucketResized.grantWrite(triggerFunction)
  
  triggerFunction.addEventSource(new eventsources.S3EventSource(s3BucketUncompressed, {
    events: [ s3.EventType.OBJECT_CREATED ]
  }));


  }
}
