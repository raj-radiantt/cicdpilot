trigger ModifyClonedLambdaInstance on Ocean_Lambda__c (after update) {
    for(Ocean_Lambda__c lambda : Trigger.New){
        ModifyClonedRequest.getChangedFields(lambda.Ocean_Request_Id__c,lambda.id, 'Ocean_Lambda__c');
    }
}