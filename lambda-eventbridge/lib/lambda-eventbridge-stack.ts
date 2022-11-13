import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnEventBusPolicy, EventBus, Rule } from "aws-cdk-lib/aws-events";

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
          detail:{
              action: ["subscribe"],
              type: ["Gold", "Silver", "Platinum"],
          }
      }
    });
  
  }
}
