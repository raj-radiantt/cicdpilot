trigger ModifyClonedS3Instance on Ocean_S3_Request__c (after update) {
    if(ModifyClonedRequest.isRecursive == true) {
        ModifyClonedRequest.getChangedFields(Trigger.newMap.keySet(),Trigger.new[0].Ocean_Request_Id__c, 'Ocean_S3_Request__c');
    }
}