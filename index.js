/**
 * @description       : order trigger lambda function main file which process events and convert to salesforce inbound queue object
 * @author            : Ramanathan
 * @group             : 
 * @last modified on  : 09-18-2023
 * @last modified by  : Ramanathan
**/

import SFConnect from "./sfconnect.js";
import AWS from 'aws-sdk';
console.log("Loading function");

export const handler = async (event, context) => {
  let inbounds = createInboundCollection(event.Records);
  try {
    let sfcon = new SFConnect();
    let result = await sfcon.postDataHelper("InboundQueue__c", inbounds);
    console.log("sfdc result: %j", result);
  } catch (error) {
    console.log("error log == %j", error);
  }
  return `Successfully processed ${event.Records.length} records.`;
}

function createInboundCollection(records) {
  let inbounds = [];
  for (const record of records) {
    console.log("DynamoDB Record: %j", record.dynamodb);
    if (record.dynamodb.NewImage) {
      let inboundObj = createinboundObj(record.dynamodb);
      inbounds.push(inboundObj);
    } else {
      console.log("trigger new event not found! %j", record);
    }
  }
  return inbounds;
}

function createinboundObj(evtdata) {
  let inboundObj = {};
  if (evtdata["NewImage"]) {
    let record  = AWS.DynamoDB.Converter.unmarshall(evtdata.NewImage);
    inboundObj = {
      DataFormat__c: "JSON",
      Endpoint__c:
        "https://hjewgvy6f73p774zsrqtklygxu0lfpno.lambda-url.us-east-1.on.aws/",
      ExternalId__c: record.id,
      ObjectAPIName__c: "Order__c",
      Payload__c: JSON.stringify(record.orderdata),
      RecordId__c: record.externalId,
      SourceSystem__c: "AWS",
      Status__c: "Pending",
      ownerId: "005B0000005GMN7IAO",
      ExternalSequenceId__c: record.SequenceNumber,
      //RequestLookup__c:(record.requestId.length <=18 ? record.requestId : null),
      CorrelationId__c : record.requestId,
      Channel__c : "Orders"
    };
    if(record.requestId.length <=18) {
      inboundObj.RequestLookup__c = record.requestId;
    }
  }
  console.log("inbound object : %j", inboundObj);
  return inboundObj;
}