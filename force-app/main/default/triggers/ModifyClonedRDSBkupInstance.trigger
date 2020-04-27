trigger ModifyClonedRDSBkupInstance on Ocean_RDS_Backup_Request__c (after update) {
    if(ModifyClonedRequest.isRecursive == true) {
        ModifyClonedRequest.getChangedFields(Trigger.newMap.keySet(),Trigger.new[0].Ocean_Request_Id__c, 'Ocean_RDS_Backup_Request__c');
    }
}