public with sharing class OceanController {
    @AuraEnabled(cacheable=true)
    public static List<OCEAN_Request__c> getOceanRequests(String status){
        return[SELECT Id,OCEAN_REQUEST_ID__c,ADO_Name__c,CreatedDate, AWSInstances__c, Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, CSP_Option_Year__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c FROM OCEAN_Request__c WHERE Request_Status__c = :status ORDER BY Submitted_Date__c];
    }
    @AuraEnabled(cacheable=true)
    public static List<OCEAN_Request__c> getPendingRequests(){
        return[SELECT Id,OCEAN_REQUEST_ID__c,ADO_Name__c,CreatedDate, AWSInstances__c, Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, CSP_Option_Year__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c FROM OCEAN_Request__c WHERE (Request_Status__c != 'Draft' OR  Request_Status__c != 'Approved') ORDER BY Submitted_Date__c];
    }
    @AuraEnabled(cacheable=false)
    public static SObject getOceanRequestById(String id){
        SObject o =  [SELECT Id, OCEAN_REQUEST_ID__c,ADO_Name__c,CreatedDate, AWSInstances__c, Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, CSP_Option_Year__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c, Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c FROM OCEAN_Request__c WHERE Id = :id ];
        return o;
    }
    @AuraEnabled(Cacheable = false)
    public static List<OCEAN_Ec2Instance__c> getEc2Instances(String oceanRequestId){
        return[SELECT Id, ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Estimated_Cost__c,Instance_Quantity__c,InstanceID__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Ebs_Storage__c> getEbsStorages(String oceanRequestId){
        return[SELECT Id, ADO_Notes__c,Application__c,Application_Component__c,AWS_Region__c,AWS_Account_Name__c,CSP_Option_Year__c,EBS_Storage_Id__c,Environment__c,Estimated_Cost__c,Estimated_Monthly_Cost__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Project_Name__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Wave_Submitted__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Vpc_Request__c> getVpcRequests(String oceanRequestId){
        return [SELECT Id, VPC_Request_Id__c, ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Region__c,Tenancy__c,Project_Name__c,Resource_Status__c,Environment__c,Wave_Submitted__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_EFS_Request__c> getEfsRequests(String oceanRequestId){
        return [SELECT Id, EFS_REQUEST_ID__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Region__c,CSP_Option_Year__c,Environment__c,Estimated_Monthly_Cost__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Project_Name__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_RDS_Request__c> getRdsRequests(String oceanRequestId){
        return [SELECT Id, RDS_Request_Id__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Availability_Zone__c,AWS_Region__c,CSP_Option_Year__c,DB_Engine_License__c,Deployment__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,InstanceType__c,Number_of_Months_Requested__c,Per_Instance_Uptime_DaysMonth__c,Per_Instance_Uptime_HoursDay__c,Project_Name__c,Provisioned_IOPS__c,Resource_Status__c,Storage_Size_GB__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_ELB_Request__c> getElbRequests(String oceanRequestId){
        return [SELECT Id,ELB_Request_ID__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Region__c,CSP_Option_Year__c,Environment__c,Estimated_Monthly_Cost__c,Load_Balancing_Type__c,Number_Load_Balancers__c,Number_of_Months_Requested__c,Project_Name__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_EMR_Request__c> getEmrRequests(String oceanRequestId){
        return [SELECT Id, EMR_Request_Id__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Region__c,CSP_Option_Year__c,Hadoop_Distribution__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,Instance_Type__c,Number_of_Months_Requested__c,Uptime_DaysMonth__c,Uptime_HoursDay__c,Project_Name__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_Lambda__c> getLambdaRequests(String oceanRequestId){
        return [SELECT Id, Lambda_Request_Id__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Account_Name__c,AWS_Region__c,CSP_Option_Year__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Project_Name__c,Resource_Status__c,Total_Estimated_Cost__c,
        Wave_Submitted__c, Estimated_Execution_Time_ms__c, Number_of_Executions_per_Month__c, Allocated_Memory_MB__c
         FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = false)
    public static List<Applications__c> getProjectDetails(String adoId){
        return [SELECT Id, Name, Primary_ADO__c, Project_Acronym__r.Project_Number__c, Project_Acronym__r.Name  FROM Applications__c WHERE Primary_ADO__c =:adoId];
    }
}