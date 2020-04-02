trigger ModifyClonedQSInstance on Ocean_QuickSight_Request__c (after update) {
    for(Ocean_QuickSight_Request__c qs : Trigger.New){
        ModifyClonedRequest.getChangedFields(qs.Ocean_Request_Id__c,qs.id, 'Ocean_QuickSight_Request__c');
    }
}