import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnEventBusPolicy, EventBus, Rule } from "aws-cdk-lib/aws-events";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import * as path from "path";
import { PolicyStatement, Effect} from 'aws-cdk-lib/aws-iam'

export class LambdaEventbridgeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

 // create a custom event bus
  const customEventBus = new EventBus(this, "CustomEventBus", {
      eventBusName: "customer-subscription-bus"
  });
  
  // define event rule
  const eventRule = new Rule(this, "EventRule", {
      eventBus: customEventBus,
      eventPattern: {
          source: ["com.aldomatic.subapp"],
           detailType: [
            'OrderCreate',
            'PaymentMade',
            'PaymentFailed',
            'PaymentCanceled',
            'DeliveryStarted',
            'DeliveryWasDelivered',
            'DeliveryWasCanceled'
          ],
          detail:{
              action: ["subscribe"],
              type: ["Gold", "Silver", "Platinum"],
          }
      }
    });
    
  const eventRuleDemo = new Rule(this, 'EventRuleDemo', {
    eventBus: customEventBus,
    eventPattern: {
      source: ["my-atm-app"],
      detail: {
        amount: [{
          numeric: [">", 300]
        }]
      }
    }
  })
    
  // eventBridge Permissions
  // const eventbridgePolicy = new PolicyStatement({
  //   effect: Effect.ALLOW,
  //   resources: ['*'],
  //   actions: ['events:*']
  // });
  
  // define lambda function
  const eventConsumerLambda = new NodejsFunction(this, 'eventConsumerLambda', {
    memorySize: 1024,
    timeout: cdk.Duration.seconds(5),
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: 'main',
    entry: path.join(__dirname, `/../lambda/event-consumer-lambda.ts`),
  });
  
  // define the lambda as the target for the event rule
  eventRule.addTarget(new LambdaFunction(eventConsumerLambda))
  eventRuleDemo.addTarget(new LambdaFunction(eventConsumerLambda))
  // eventConsumerLambda.addToRolePolicy(eventbridgePolicy) // we add this policy if we are going to send put events from the lambda

  }
}
