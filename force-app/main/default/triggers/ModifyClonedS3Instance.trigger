trigger ModifyClonedS3Instance on Ocean_S3_Request__c (after update) {
    for(Ocean_S3_Request__c s3 : Trigger.New){
        ModifyClonedRequest.getChangedFields(s3.Ocean_Request_Id__c,s3.id, 'Ocean_S3_Request__c');
    }
}