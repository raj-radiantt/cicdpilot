public with sharing class OceanController {
    @AuraEnabled(cacheable=false)
    public static OceanRequestWrapper getOceanRequestById(String id){
        OCEAN_Request__c o =  [SELECT Id, Name, Approval_Comments__c, Review_Outcome__c, CreatedDate, AWSInstances__c, Review_Status__c, CRMT_Request_Status__c,ApplicationName__r.Application_Acronym__c,Assumptions__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,Total_Estimated_Cost__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c,
                               RFP_Received_Date__c, ROM_Received_Date__c, RFP_Requested_Date__c, ROM_Requested_Date__c 
                               FROM OCEAN_Request__c WHERE Id = :id ];

        OceanRequestWrapper request = new OceanRequestWrapper();
        request.id = o.Id;
        request.displayId = o.Name;
        request.awsInstances = o.AWSInstances__c.split(';');        
        request.requestStatus = o.Request_Status__c;
        request.CRMTStatus = o.CRMT_Request_Status__c;
        request.reviewStage = o.Review_Status__c;
        request.comment = o.Approval_Comments__c;
        request.reviewOutcome = o.Review_Outcome__c;
        request.applicationDetails = getApplicationDetails(o.ApplicationName__c);

        return request;
    }

    @AuraEnabled(cacheable = true)
    public static List<Admin_Review_Stage__mdt> getAdminReviewStages(){
         List<Admin_Review_Stage__mdt> reviewStages = [SELECT DeveloperName, Approval_Status__c, Denial_Status__c, Action__c, UserRoleAccess__c,
                    Status__c,User_Prompt__c FROM Admin_Review_Stage__mdt ];   

         return reviewStages;
    }
    
    @AuraEnabled(Cacheable = false)
    public static List<OceanApprovalHistoryWrapper> getApprovalHistory(String Id){
        List<OceanApprovalHistoryWrapper> approvalHistoryList = new List<OceanApprovalHistoryWrapper>();
        
        Ocean_request__c request= [Select Id, 
        (Select Id,TargetObjectId, StepStatus, CreatedDate, Comments, Actor.Name, ProcessNode.Name From ProcessSteps ORDER BY CreatedDate DESC) from Ocean_Request__c where Id =: Id];
        List<ProcessInstanceHistory> pihList = new List<ProcessInstanceHistory>();
        pihList.addAll(request.ProcessSteps);

        for(ProcessInstanceHistory PIH : pihList) {
            OceanApprovalHistoryWrapper approvalHistory = new OceanApprovalHistoryWrapper();
                approvalHistory.id = PIH.Id;
                if(PIH.StepStatus == 'Started'){
                    approvalHistory.stepStatus = 'Submitted' ;
                } else {
                    approvalHistory.stepStatus = PIH.StepStatus;
                }
                approvalHistory.comments = PIH.Comments;
                approvalHistory.createdDate = PIH.CreatedDate.format('MM/dd/yyyy, h:mm a');
                approvalHistory.approver = PIH.Actor.Name;  
                if((PIH.ProcessNode.Name == '') || (PIH.ProcessNode.Name == null)){
                    approvalHistory.stepName = 'Approval Request Submitted';
                }else {
                    approvalHistory.stepName = PIH.ProcessNode.Name;
                }
                approvalHistoryList.add(approvalHistory);         
            }

        return approvalHistoryList;   
    }
    
    @AuraEnabled
    public static Map<String,List<SObject>> getResourceRequestSummary(String oceanRequestId){
      String reqId = [SELECT Id FROM Ocean_Request__c WHERE Id =:oceanRequestId LIMIT 1].Id;
      List<AWS_Resource__mdt> awsResourceMetadataList = [SELECT MasterLabel,API_Name__c,Sequence__c FROM AWS_Resource__mdt ORDER BY Sequence__c ASC];
      Map<String,List<SObject>> objMap = new Map<String,List<SObject>>();
      for(AWS_Resource__mdt awsmdt : awsResourceMetadataList){
          String query = 'SELECT sum(Calculated_Cost__c) envCost, Environment__c environment, count(Id) requestCount FROM ' + awsmdt.API_Name__c + ' WHERE Ocean_Request_Id__c =' +'\''+reqId + '\' GROUP BY Environment__c';
          objMap.put(awsmdt.MasterLabel, Database.query(query));
      }      
      return objMap;
    }

    @AuraEnabled
    public static SObject getCostAndCount(String sObjectName, String oceanRequestId){
        String reqId = [SELECT Id FROM Ocean_Request__c WHERE Id =:oceanRequestId LIMIT 1].Id;
        String objectName = [SELECT MasterLabel,API_Name__c,Sequence__c FROM AWS_Resource__mdt WHERE API_Name__c =: sObjectName].API_Name__c;

        if(String.isNotEmpty(reqId) && String.isNotEmpty(objectName)){
            String query = 'SELECT count(Id) recordCount, sum(Calculated_Cost__c) totalCost FROM ' + objectName +' WHERE Ocean_Request_Id__c =' +'\''+reqId + '\'';
            return Database.query(query);    
        }
        return null;  
    }

    @AuraEnabled
    public static List<Ocean_Wave__c> getCurrentOceanWave(){
        List<Ocean_Wave__c> waveDueDates = [SELECT ADO_Submission_Due_Date__c FROM Ocean_Wave__c WHERE ADO_Submission_Due_Date__c > Today ORDER BY Wave_Start_Date__c ASC Limit 2];
        System.debug(waveDueDates);
        return waveDueDates;
    }

    @AuraEnabled(Cacheable = false)
    public static List<OCEAN_Ec2Instance__c> getEc2Instances(String oceanRequestId, Integer pageNumber, Integer  pageSize){

        return [SELECT Id,Name,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c, AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Estimated_Cost__c,Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate 
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_S3_Request__c> getS3Requests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return[SELECT Id,Name, ADO_Notes__c,Ocean_Request_Id__c, Application_Component__c,AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Data_Retrieval_GBMonth__c,Data_Retrieval_Type__c,Resource_Status__c,Environment__c,Estimated_Monthly_Cost__c,GETSELECT_and_Other_Requests__c,Total_Storage_GBMonth__c,Number_of_Lifecycle_Transition_Requests__c,Number_of_Months_Requested__c,Objects_Monitored_per_Month__c,Storage_Not_Accessed_in_30_Days__c,PUTCOPYPOSTLIST_Requests__c,Storage_Type__c,Total_Estimated_Cost__c FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Ebs_Storage__c> getEbsStorages(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return[SELECT Id,Name, ADO_Notes__c,Application_Component__c,AWS_Region__c,Calculated_Cost__c,Environment__c,Estimated_Cost__c,Estimated_Monthly_Cost__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Wave_Submitted__c,AWS_Accounts__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_Vpc_Request__c> getVpcRequests(String oceanRequestId, Integer pageNumber, Integer pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Tenancy__c,Calculated_Cost__c,Resource_Status__c,Environment__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(Cacheable = false)
    public static List<Ocean_EFS_Request__c> getEfsRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_RDS_Request__c> getRdsRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Availability_Zone__c,AWS_Region__c,DB_Engine_License__c,Deployment__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,InstanceType__c,Number_of_Months_Requested__c,Storage_Type__c,Per_Instance_Uptime_DaysMonth__c,Per_Instance_Uptime_HoursDay__c,Provisioned_IOPS__c,Resource_Status__c,Storage_Size_GB__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_RDS_Backup_Request__c> getRdsBkupRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c, Additional_Backup_Storage_GB_Per_Month__c,Backup_Storage_Type__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_ELB_Request__c> getElbRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id,Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Environment__c,Calculated_Cost__c,Estimated_Monthly_Cost__c,Load_Balancing_Type__c,Data_Processed_per_Load_Balancer__c,Number_Load_Balancers__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }

    @AuraEnabled(cacheable = false)
    public static List<Ocean_EMR_Request__c> getEmrRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Hadoop_Distribution__c,Calculated_Cost__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,Instance_Type__c,Number_of_Months_Requested__c,Uptime_DaysMonth__c,Uptime_HoursDay__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_Lambda__c> getLambdaRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c, Calculated_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,
         Estimated_Execution_Time_ms__c, Number_of_Executions_per_Month__c, Allocated_Memory_MB__c
         FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
         LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_QuickSight_Request__c> getQuickSightRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c, Application_Component__c, AWS_Accounts__c, AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,No_of_Sessions_per_UserMonth__c,Number_of_Months_Requested__c,Resource_Status__c, Calculated_Cost__c,Total_Estimated_Cost__c, User_Type__c, No_of_Users__c, Subscription_Model__c
         FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
         LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }   
    @AuraEnabled(cacheable = false)
    public static List<Ocean_DynamoDB_Request__c> getDdbRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Capacity_Type__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Read_Capacity_Units_per_Month__c,Read_Consistency__c,Reservation_Term__c,Total_Data_Storage_GBMonth__c,Write_Capacity_Units_per_Month__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
     @AuraEnabled(cacheable = false)
     public static List<Ocean_DataTransfer_Request__c> getDataTransferRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
         return [SELECT Id, Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Data_Transfer_Amount_GBMonth__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Data_Transfer_Type__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
         LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }   
    @AuraEnabled(cacheable = false)
    public static List<Ocean_Workspaces_Request__c> getWorkspaceRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Additional_Storage_per_User_GB__c,Billing_Options__c,License__c,Number_of_Workspaces__c,Root_Volume_User_Volume__c,Workspace_Bundle__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_Redshift_Request__c> getRedshiftRequests(String oceanRequestId, Integer pageNumber, Integer  pageSize){
        return [SELECT Id, Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Funding_Type__c,Node_Quantity__c,Redshift_Type__c,Usage_Hours_Per_Day__c, Usage_Hours_Per_Month__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
    }
    @AuraEnabled(cacheable = false)
    public static List<Ocean_Other_Request__c> getOtherRequests(String oceanRequestId, Integer pageNumber, Integer pageSize){
        return [SELECT Id, Name, Resource_Status__c,ADO_Notes__c,Application_Component__c,AWS_Accounts__c,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Total_Estimated_Cost__c,AWS_Service__c,Quantity__c,Unit__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate
        LIMIT :pageSize OFFSET :(pageNumber - 1) * pageSize];
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