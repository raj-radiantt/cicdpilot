trigger ModifyClonedEFSInstance on Ocean_EFS_Request__c (after update) {
    for(Ocean_EFS_Request__c efs : Trigger.New){
        ModifyClonedRequest.getChangedFields(efs.Ocean_Request_Id__c,efs.id, 'Ocean_EFS_Request__c');
    }
}