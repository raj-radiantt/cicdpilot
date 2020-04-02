trigger ModifyClonedVPCInstance on Ocean_Vpc_Request__c (after update) {
    for(Ocean_Vpc_Request__c vpc : Trigger.New){
        ModifyClonedRequest.getChangedFields(vpc.Ocean_Request_Id__c,vpc.id, 'Ocean_Vpc_Request__c');
    }
}