import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Effect} from 'aws-cdk-lib/aws-iam'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from "path";

export class LambdaApigatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // EventBridge Permissions
    const eventbridgePutPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: ['events:PutEvents']
    });

    // create the API Gateway to OrderCreate
    const OrderCreateAPI = new RestApi(this, "OrderCreateAPI");
    
    const OrderFunction = new NodejsFunction(this, 'OrderFunction', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../lambda/app.ts`),
      environment: {
        EVENT_BUS: 'myCustomEventBus'
      }
    });
  
    OrderFunction.addToRolePolicy(eventbridgePutPolicy)
    
     OrderCreateAPI.root
     .resourceForPath("/order")
    .addMethod("POST", new LambdaIntegration(OrderFunction));
    
  }
}
