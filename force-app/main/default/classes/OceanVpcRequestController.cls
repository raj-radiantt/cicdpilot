public with sharing class OceanVpcRequestController {
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Vpc_Request__c> getVpcRequests(String oceanRequestId){
        return [SELECT VPC_Request_Id__c, ADO_Notes__c,Application__c,Application_Component__c,AWS_Region__c,Tenancy__c,Project_Name__c,Resource_Status__c,Environment__c,Wave_Submitted__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
}
