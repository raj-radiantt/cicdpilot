public with sharing class OceanEc2ComputeController {
    @AuraEnabled(Cacheable = true)
    public static List<OCEAN_Ec2Instance__c> getEc2Instances(String oceanRequestId){
        return [SELECT ADO_FUNDING_TYPE__c, ADO_Notes__c,Application__c, Application_Component__c, AWS_Availability_Zone__c, AWS_Region__c, Cloud_Resource_Projection__c, EC2_Instance_Type__c, Estimated_Cost__c, Instance_Quantity__c, InstanceID__c, PerInstanceUptimePerDay__c, PerInstanceUptimePerMonth__c, Platform__c, Project_Name__c, Resource_Status__c, Tier__c, TotalUptimePerMonth__c, TotalUptimePerYear__c, Wave_Submitted__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY Tier__c limit 10];
    }

    @AuraEnabled
    public static void deleteEc2Instances(list<Id> lstIds){
        try {
            list<OCEAN_Ec2Instance__c> lstToRemove = new list<OCEAN_Ec2Instance__c>();
            System.debug('lstIds ====> '+lstIds);
            for(Id idIns : lstIds) {
                lstToRemove.add(new OCEAN_Ec2Instance__c(Id = idIns));
            }
            if(!lstToRemove.isEmpty()) {
                delete lstToRemove;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

}