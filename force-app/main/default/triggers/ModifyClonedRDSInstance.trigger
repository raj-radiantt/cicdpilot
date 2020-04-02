trigger ModifyClonedRDSInstance on Ocean_RDS_Request__c (after update) {
    for(Ocean_RDS_Request__c rds : Trigger.New){
        ModifyClonedRequest.getChangedFields(rds.Ocean_Request_Id__c,rds.id, 'Ocean_RDS_Request__c');
    }
}