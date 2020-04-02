trigger ModifyClonedDTInstance on Ocean_DataTransfer_Request__c (after update) {
    for(Ocean_DataTransfer_Request__c dt : Trigger.New){
        ModifyClonedRequest.getChangedFields(dt.Ocean_Request_Id__c,dt.id, 'Ocean_DataTransfer_Request__c');
    }
}