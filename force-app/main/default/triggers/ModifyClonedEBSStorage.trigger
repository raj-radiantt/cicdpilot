trigger ModifyClonedEBSStorage on Ocean_Ebs_Storage__c (after update) {
    for(Ocean_Ebs_Storage__c ebs : Trigger.New){
        ModifyClonedRequest.getChangedFields(ebs.Ocean_Request_Id__c,ebs.id, 'Ocean_Ebs_Storage__c');
    }
}