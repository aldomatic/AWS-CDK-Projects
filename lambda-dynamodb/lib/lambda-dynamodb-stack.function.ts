import * as AWSXRay from 'aws-xray-sdk'
import * as AWS_SDK from 'aws-sdk'
import { APIGatewayProxyEvent } from "aws-lambda";

const AWS = AWSXRay.captureAWS(AWS_SDK)
const docClient = new AWS.DynamoDB.DocumentClient();

const table = process.env.DYNAMODB || 'undefined'

// scan params
const params = {
    TableName: table
}

// dynamodb scan function
async function scanItems(){
    try {
        const data = await docClient.scan(params).promise()
        return data
    } catch (err){
        return err
    }
}

// lambda handler
exports.handler = async (event:APIGatewayProxyEvent ) => {
    try {
        console.log(event)
        const data = await scanItems()
        return {
            body: JSON.stringify(data)
        }
    } catch (err) {
        return {
            error: err
        }
    }
}
