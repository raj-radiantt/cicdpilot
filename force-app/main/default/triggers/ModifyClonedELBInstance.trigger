trigger ModifyClonedELBInstance on Ocean_ELB_Request__c (after update) {
    for(Ocean_ELB_Request__c elb : Trigger.New){
        ModifyClonedRequest.getChangedFields(elb.Ocean_Request_Id__c,elb.id, 'Ocean_ELB_Request__c');
    }
}