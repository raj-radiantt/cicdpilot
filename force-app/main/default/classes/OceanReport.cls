public with sharing class OceanReport {
    @AuraEnabled
    public static List<Ocean_Request__c> getOceanRequestsForExport(){
        return [SELECT Id, Name, Approval_Comments__c, Review_Outcome__c, CreatedDate, AWSInstances__c, Review_Status__c, CRMT_Request_Status__c,ApplicationName__r.Application_Acronym__c,Assumptions__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,Total_Estimated_Cost__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c,
                RFP_Received_Date__c, ROM_Received_Date__c, RFP_Requested_Date__c, ROM_Requested_Date__c 
                FROM OCEAN_Request__c];
    }

    @AuraEnabled
    public static List<OCEAN_Ec2Instance__c> getEc2InstancesForExport(){
        return [SELECT Id,Name,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c, AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Estimated_Cost__c,Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c ORDER BY  CreatedDate];      
    }
}
