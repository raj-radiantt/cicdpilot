public with sharing class OceanController {
    @AuraEnabled(cacheable=true)
    public static List<OCEAN_Request__c> getDraftRequests(String status){
        return[SELECT CreatedDate, ADOName__c, AWSInstances__c, Application_Acronym__c,Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c, Option_Year__c, Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave_Submitted__c FROM OCEAN_Request__c WHERE Request_Status__c = :status ORDER BY Submitted_Date__c];
    }
    @AuraEnabled(cacheable=true)
    public static SObject getOceanRequestById(String id){
        SObject o =  [SELECT CreatedDate, ADOName__c, AWSInstances__c, Application_Acronym__c,Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c, Option_Year__c, Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave_Submitted__c FROM OCEAN_Request__c WHERE Id = :id ];
        return o;
    }
    @AuraEnabled(Cacheable = false)
    public static List<OCEAN_Ec2Instance__c> getEc2Instances(String oceanRequestId){
        return[SELECT ADO_FUNDING_TYPE__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Availability_Zone__c,AWS_Region__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Estimated_Cost__c,Instance_Quantity__c,InstanceID__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Platform__c,Project_Name__c,Resource_Status__c,Environment__c,Wave_Submitted__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Ebs_Storage__c> getEbsStorages(String oceanRequestId){
        return[SELECT ADO_Notes__c,Application__c,Application_Component__c,AWS_Region__c,CSP_Option_Year__c,EBS_Storage_Id__c,Environment__c,Estimated_Cost__c,Estimated_Monthly_Cost__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Project_Name__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Wave_Submitted__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Vpc_Request__c> getVpcRequests(String oceanRequestId){
        return [SELECT VPC_Request_Id__c, ADO_Notes__c,Application__c,Application_Component__c,AWS_Region__c,Tenancy__c,Project_Name__c,Resource_Status__c,Environment__c,Wave_Submitted__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_EFS_Request__c> getEfsRequests(String oceanRequestId){
        return [SELECT EFS_REQUEST_ID__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Region__c,CSP_Option_Year__c,Environment__c,Estimated_Monthly_Cost__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Project_Name__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
}
