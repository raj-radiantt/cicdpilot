trigger ModifyClonedRSInstance on Ocean_Redshift_Request__c (after update) {
    for(Ocean_Redshift_Request__c rs : Trigger.New){
        ModifyClonedRequest.getChangedFields(rs.Ocean_Request_Id__c,rs.id, 'Ocean_Redshift_Request__c');
    }
}