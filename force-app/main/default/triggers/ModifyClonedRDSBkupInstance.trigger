trigger ModifyClonedRDSBkupInstance on Ocean_RDS_Backup_Request__c (after update) {
    for(Ocean_RDS_Backup_Request__c rdsbkup : Trigger.New){
        ModifyClonedRequest.getChangedFields(rdsbkup.Ocean_Request_Id__c,rdsbkup.id, 'Ocean_RDS_Backup_Request__c');
    }
}