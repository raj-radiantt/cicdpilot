public with sharing class OceanEbsStorageController {
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Ebs_Storage__c> getEbsStorages(String oceanRequestId){
        return[SELECT ADO_Notes__c,Application__c,Application_Component__c,AWS_Region__c,CSP_Option_Year__c,EBS_Storage_Id__c,Environment__c,Estimated_Cost__c,Estimated_Monthly_Cost__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Project_Name__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Wave_Submitted__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
}