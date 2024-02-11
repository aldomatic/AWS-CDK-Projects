import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from "path";
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { DynamoEventSource } from "@aws-cdk/aws-lambda-event-sources";
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

export class LambdaDynamodbStreamingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const scheduleLambda = new NodejsFunction(this, 'scheduleLambda', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'main',
      entry: path.join(__dirname, `/../lambda/schedule-lambda.ts`),
    })
    
    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '5', hour: '0' }),
    })
    
    eventRule.addTarget(new LambdaFunction(scheduleLambda))
    
    
    // dynamodb table
    const table = new dynamodb.Table(this, 'Table', {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: { name: 'leadId', type: dynamodb.AttributeType.STRING },    
        stream: dynamodb.StreamViewType.NEW_IMAGE,
        removalPolicy: RemovalPolicy.DESTROY,
        tableName: "leadsTable"
    });
    
    // streaming lambda function
    const streamingLambda = new NodejsFunction(this, 'streamingLambda', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'main',
      entry: path.join(__dirname, `/../lambda/streaming-lambda.ts`),
    });
    
    
     new lambda.CfnEventSourceMapping(this,"UserLoginTableStreamTrigger",{      
        functionName: streamingLambda.functionName,
        batchSize: 5,
        eventSourceArn: table.tableStreamArn,
        filterCriteria: {
          filters: [{
            pattern: ' {"eventName": ["MODIFY"]}',
          }],
        },      
        startingPosition: "TRIM_HORIZON", 
    });
    
    table.grantStreamRead(streamingLambda);
    table.grantReadWriteData(streamingLambda);
    
    
    
    // streamingLambda.addEventSource(new DynamoEventSource(this, {  
    //   startingPosition: lambda.StartingPosition.TRIM_HORIZON  
    // }));

    // const sourceMapping = new DynamoEventSource(table, {
    //   startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    //   batchSize: 1,
    //   bisectBatchOnError: true,
    //   retryAttempts: 3,
    // })
    
    // streamingLambda.addEventSource(sourceMapping)
    // table.grantStreamRead(streamingLambda)
  
  }
}
