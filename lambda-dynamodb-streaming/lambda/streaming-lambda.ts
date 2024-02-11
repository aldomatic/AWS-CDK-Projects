import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export async function main(event: any){
  event.Records.forEach(function(record: any) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
    });

  return {
    body: JSON.stringify({message: 'Successful lambda invocation'}),
    statusCode: 200,
  };
}