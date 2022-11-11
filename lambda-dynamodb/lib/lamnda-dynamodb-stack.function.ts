import * as AWSXRay from 'aws-xray-sdk'
import * as AWS_SDK from 'aws-sdk'

const AWS = AWSXRay.captureAWS(AWS_SDK)
const docClient = new AWS.DynamoDB.DocumentClient();


