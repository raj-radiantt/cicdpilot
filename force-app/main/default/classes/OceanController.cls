public with sharing class OceanController {
    @AuraEnabled(cacheable=false)
    public static OceanRequestWrapper getOceanRequestById(String id){
        OCEAN_Request__c o =  [SELECT Id, Name, CreatedDate, AWSInstances__c, Review_Status__c, CRMT_Request_Status__c,ApplicationName__r.Application_Acronym__c,Assumptions__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,Total_Estimated_Cost__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c FROM OCEAN_Request__c WHERE Id = :id ];

        OceanRequestWrapper request = new OceanRequestWrapper();
        request.id = o.Id;
        request.displayId = o.Name;
        request.awsInstances = o.AWSInstances__c.split(';');        
        request.requestStatus = o.Request_Status__c;
        request.CRMTStatus = o.CRMT_Request_Status__c;
        request.reviewStage = o.Review_Status__c;
        request.applicationDetails = getApplicationDetails(o.ApplicationName__c);

        return request;
    }

    @AuraEnabled(cacheable = true)
    public static Map<String,Map<String,String>> getCRMTRequestStatus(){
        Map<String,Map<String,String>> statuses = new Map<String,Map<String,String>>();
        Map<String,String> CRMTRequestStatus = new Map<String,String>();
        CRMTRequestStatus.put('DRAFT','Draft');
        CRMTRequestStatus.put('CORGTL','COR/GTL Approval');
        CRMTRequestStatus.put('CRMT_INTAKE','CRMT Intake Review');
        CRMTRequestStatus.put('CRMT_LEADERSHIP','CRMT Intake Leadership Review');
        CRMTRequestStatus.put('INTAKE_COMPLETE','CRMT Intake Review Complete');
        CRMTRequestStatus.put('ROM_REQUESTED','ROM Requested');
        CRMTRequestStatus.put('INITIAL_ROM','Initial ROM Review');
        CRMTRequestStatus.put('LEADERSHIP_ROM','ROM Leadership Review');
        CRMTRequestStatus.put('ROM_REVIEWED','ROM Reviewed');
        CRMTRequestStatus.put('RFP_REQUESTED','RFP Requested');
        CRMTRequestStatus.put('INITIAL_RFP','Initial RFP Review');
        CRMTRequestStatus.put('LEADERSHIP_RFP','RFP Leadership Review');
        CRMTRequestStatus.put('RFP_REVIEWED','RFP Reviewed');
        CRMTRequestStatus.put('RFP_ACCEPTED','RFP Accepted');
        CRMTRequestStatus.put('ATTEST_REQUEST','Attestation Requested');
        CRMTRequestStatus.put('REQUEST_COMPLETE','Request Complete');

        statuses.put('STATUSES',CRMTRequestStatus);
        statuses.put('CRMT_STATUSES',getRequestStatus());

        return statuses;
    }

    private static Map<String,String> getRequestStatus(){
        Map<String,String> requestStatus = new Map<String,String>();
        requestStatus.put('DRAFT','Draft');
        requestStatus.put('CORGTL','COR/GTL Approval');
        requestStatus.put('CRMT_REVIEW','CRMT Review');
        requestStatus.put('ATTEST_REQUESTED','Attestation Requested');
        requestStatus.put('REQUEST_COMPLETE','Request Complete');

        return requestStatus;
    }

    @AuraEnabled(Cacheable = false)
    public static List<OCEAN_Ec2Instance__c> getEc2Instances(String oceanRequestId){
        return [SELECT Id,Name,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c, AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Estimated_Cost__c,Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = true)
    public static List<Ocean_S3_Request__c> getS3Requests(String oceanRequestId){
        return[SELECT Id,Name,S3_Request_Id__c, ADO_Notes__c,Ocean_Request_Id__c, Application_Component__c,AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Data_Retrieval_GBMonth__c,Data_Retrieval_Type__c,Resource_Status__c,Environment__c,Estimated_Monthly_Cost__c,GETSELECT_and_Other_Requests__c,Total_Storage_GBMonth__c,Number_of_Lifecycle_Transition_Requests__c,Number_of_Months_Requested__c,Objects_Monitored_per_Month__c,Storage_Not_Accessed_in_30_Days__c,PUTCOPYPOSTLIST_Requests__c,Storage_Type__c,Total_Estimated_Cost__c FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = true)
    public static List<Ocean_Ebs_Storage__c> getEbsStorages(String oceanRequestId){
        return[SELECT Id,Name, ADO_Notes__c,Application_Component__c,AWS_Region__c,EBS_Storage_Id__c,Calculated_Cost__c,Environment__c,Estimated_Cost__c,Estimated_Monthly_Cost__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Wave_Submitted__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = true)
    public static List<Ocean_Vpc_Request__c> getVpcRequests(String oceanRequestId){
        return [SELECT Id, Name,VPC_Request_Id__c, ADO_Notes__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Tenancy__c,Calculated_Cost__c,Resource_Status__c,Environment__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(Cacheable = true)
    public static List<Ocean_EFS_Request__c> getEfsRequests(String oceanRequestId){
        return [SELECT Id, Name, EFS_REQUEST_ID__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_RDS_Request__c> getRdsRequests(String oceanRequestId){
        return [SELECT Id, Name, RDS_Request_Id__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Availability_Zone__c,AWS_Region__c,DB_Engine_License__c,Deployment__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,InstanceType__c,Number_of_Months_Requested__c,Storage_Type__c,Per_Instance_Uptime_DaysMonth__c,Per_Instance_Uptime_HoursDay__c,Provisioned_IOPS__c,Resource_Status__c,Storage_Size_GB__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_RDS_Backup_Request__c> getRdsBkupRequests(String oceanRequestId){
        return [SELECT Id, Name, Ocean_RDS_Backup_Request_ID__c,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c, Additional_Backup_Storage_GB_Per_Month__c,Backup_Storage_Type__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_ELB_Request__c> getElbRequests(String oceanRequestId){
        return [SELECT Id,Name, ELB_Request_ID__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Environment__c,Calculated_Cost__c,Estimated_Monthly_Cost__c,Load_Balancing_Type__c,Data_Processed_per_Load_Balancer__c,Number_Load_Balancers__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_EMR_Request__c> getEmrRequests(String oceanRequestId){
        return [SELECT Id, Name, EMR_Request_Id__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Hadoop_Distribution__c,Calculated_Cost__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,Instance_Type__c,Number_of_Months_Requested__c,Uptime_DaysMonth__c,Uptime_HoursDay__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_Lambda__c> getLambdaRequests(String oceanRequestId){
        return [SELECT Id, Name, Lambda_Request_Id__c,ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,
         Estimated_Execution_Time_ms__c, Number_of_Executions_per_Month__c, Allocated_Memory_MB__c
         FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_QuickSight_Request__c> getQuickSightRequests(String oceanRequestId){
        return [SELECT Id, Name, ADO_Notes__c, Application_Component__c, AWS_Accounts__c, QuickSight_Request_Id__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,No_of_Sessions_per_UserMonth__c,Number_of_Months_Requested__c,Resource_Status__c, Calculated_Cost__c,Total_Estimated_Cost__c, User_Type__c, No_of_Users__c, Subscription_Model__c
         FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }   
    @AuraEnabled(cacheable = true)
    public static List<Ocean_DynamoDB_Request__c> getDdbRequests(String oceanRequestId){
        return [SELECT Id, Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Capacity_Type__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Read_Capacity_Units_per_Month__c,Read_Consistency__c,Reservation_Term__c,Total_Data_Storage_GBMonth__c,Write_Capacity_Units_per_Month__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_DataTransfer_Request__c> getDataTransferRequests(String oceanRequestId){
        return [SELECT Id, Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Data_Transfer_Amount_GBMonth__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Data_Transfer_Type__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }   
    @AuraEnabled(cacheable = true)
    public static List<Ocean_Workspaces_Request__c> getWorkspaceRequests(String oceanRequestId){
        return [SELECT Id, Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Additional_Storage_per_User_GB__c,Billing_Options__c,License__c,Number_of_Workspaces__c,Root_Volume_User_Volume__c,Workspace_Bundle__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_Redshift_Request__c> getRedshiftRequests(String oceanRequestId){
        return [SELECT Id, Name, Ocean_Redshift_Request_Id__c, ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Funding_Type__c,Node_Quantity__c,Redshift_Type__c,Usage_Hours_Per_Day__c, Usage_Hours_Per_Month__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }
    @AuraEnabled(cacheable = true)
    public static List<Ocean_Other_Request__c> getOtherRequests(String oceanRequestId){
        return [SELECT Id, Name, Ocean_Other_Request_Id__c,Resource_Status__c,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Total_Estimated_Cost__c,AWS_Service__c,Quantity__c,Unit__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
    }

    @AuraEnabled(cacheable = false)
    public static OceanApplicationWrapper getApplicationDetails(String appId) {
        OceanApplicationWrapper application = new OceanApplicationWrapper();
        Applications__c applicationDetails = [SELECT Id, Name, Primary_ADO__r.Name, Primary_ADO__c, Project_Acronym__r.Name, Project_Acronym__r.Project_Number__c, Application_Acronym__c FROM Applications__c WHERE Id =:appId LIMIT 1];

        application.adoName = applicationDetails.Primary_ADO__r.Name;
        application.awsAccounts = getAWSAccounts(applicationDetails.id);
        application.id = applicationDetails.Id;
        application.name = applicationDetails.Name;
        application.acronym = applicationDetails.Application_Acronym__c;
        application.projectNumber = applicationDetails.Project_Acronym__r.Project_Number__c;
        application.wave = getWaveDetails();

        return application;
    }
    @AuraEnabled(cacheable = false)
    public static OceanWaveWrapper getWaveDetails(){
        OceanWaveWrapper wave = new OceanWaveWrapper();  
        Ocean_Wave__c waveDetails = [SELECT Id, Name, Active_Wave__c, CSP_Option_Year__c, CSP_Option_Year__r.Name, CSP_Option_Year__r.Remaining_Months_in_OY__c, CSP_Option_Year__r.Option_Year_End_Date__c,
                                     CSP_Option_Year__r.Option_Year_Start_Date__c, Wave_Start_Date__c, Wave_End_Date__c
                                     FROM Ocean_Wave__c WHERE Active_Wave__c = TRUE LIMIT 1]; 

        wave.id = waveDetails.Id;
        wave.name = waveDetails.Name;
        wave.isActive = waveDetails.Active_Wave__c;
        wave.waveStartDate = waveDetails.Wave_Start_Date__c;
        wave.waveEndDate = waveDetails.Wave_End_Date__c;
        wave.cspOY = waveDetails.CSP_Option_Year__r.Name;
        wave.oyStartDate = waveDetails.CSP_Option_Year__r.Option_Year_Start_Date__c;
        wave.oyEndDate = waveDetails.CSP_Option_Year__r.Option_Year_End_Date__c;
        wave.oyMonthsRemaining = waveDetails.CSP_Option_Year__r.Remaining_Months_in_OY__c;

        return wave;
    }

    @AuraEnabled(Cacheable = false)
    public static List<OceanAWSAccountWrapper> getAWSAccounts(String appId){

        List<OceanAWSAccountWrapper> awsAccounts = new List<OceanAWSAccountWrapper>();
        List<AWS_Accounts_Applications__c> awsAccountDetails = [SELECT Id, Name, Applications__c, AWS_Accounts__c,AWS_Accounts__r.Name FROM AWS_Accounts_Applications__c WHERE Applications__c =: appId];          

        for(AWS_Accounts_Applications__c awsAcc : awsAccountDetails){
            OceanAWSAccountWrapper awsAccWrap = new OceanAWSAccountWrapper();
            awsAccWrap.value = awsAcc.AWS_Accounts__c;
            awsAccWrap.label = awsAcc.AWS_Accounts__r.Name;       
            awsAccounts.add(awsAccWrap);    
        }
       
        return awsAccounts;        
    }


}