trigger ModifyClonedDynamoInstance on Ocean_DynamoDB_Request__c (after update) {
    for(Ocean_DynamoDB_Request__c dynamo : Trigger.New){
        ModifyClonedRequest.getChangedFields(dynamo.Ocean_Request_Id__c,dynamo.id, 'Ocean_DynamoDB_Request__c');
    }
}
