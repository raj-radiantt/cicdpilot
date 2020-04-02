trigger ModifyClonedOtherInstance on Ocean_Other_Request__c (after update) {
    for(Ocean_Other_Request__c other : Trigger.New){
        ModifyClonedRequest.getChangedFields(other.Ocean_Request_Id__c,other.id, 'Ocean_Other_Request__c');
    }
}