trigger ModifyClonedEMRInstance on Ocean_EMR_Request__c (after update) {
    for(Ocean_EMR_Request__c emr : Trigger.New){
        ModifyClonedRequest.getChangedFields(emr.Ocean_Request_Id__c,emr.id, 'Ocean_EMR_Request__c');
    }
}