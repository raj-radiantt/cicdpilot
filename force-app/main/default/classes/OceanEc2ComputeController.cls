public with sharing class OceanEc2ComputeController {
    @AuraEnabled(Cacheable = false)
    public static List<OCEAN_Ec2Instance__c> getEc2Instances(String oceanRequestId){
        return[SELECT ADO_FUNDING_TYPE__c, ADO_Notes__c,Application__c, Application_Component__c, Per_Instance_Running_Months_in_Remaining__c, AWS_Availability_Zone__c, AWS_Region__c, Cloud_Resource_Projection__c, EC2_Instance_Type__c, Estimated_Cost__c, Instance_Quantity__c, InstanceID__c, PerInstanceUptimePerDay__c, PerInstanceUptimePerMonth__c, Platform__c, Project_Name__c, Resource_Status__c,  Environment__c, TotalUptimePerMonth__c, TotalUptimePerYear__c, Wave_Submitted__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
}