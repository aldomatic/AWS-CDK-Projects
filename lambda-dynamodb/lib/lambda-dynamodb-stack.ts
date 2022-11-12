import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export class LambdaDynamodbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // define dynamodb table
    const dynamodb_table = new dynamodb.Table(this, 'Table', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey:{
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.DESTROY
    })
    // define lambda function
    const lambda_backend = new NodejsFunction(this, "function", {
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        DYNAMODB: dynamodb_table.tableName
      }
    })
    
    // grant lambda function read access to dynamodb table
    dynamodb_table.grantReadData(lambda_backend.role!)
    
    // define apigateway
    const api = new apigateway.RestApi(this, 'RestAPI', {
      deployOptions: {
        dataTraceEnabled: true,
        tracingEnabled: true
      }
    })
    
    // define endpoint and associate it with a lambda backend
    const endpoint = api.root.addResource('scan');
    const endpointMethod = endpoint.addMethod('GET', new apigateway.LambdaIntegration(lambda_backend))
    
  }
}
