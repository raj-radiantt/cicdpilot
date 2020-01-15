public with sharing class OceanExport {
    @AuraEnabled
    public static Map<String,List<sObject>> getDataForExport(String oceanRequestId){
        Map<String,List<sObject>> exportDataMap = new Map<String,List<sObject>>();

        List<SObject> oceanReqList = [SELECT Name, Approval_Comments__c, Review_Outcome__c, CreatedDate, AWSInstances__c, Review_Status__c, CRMT_Request_Status__c,ApplicationName__r.Application_Acronym__c,Assumptions__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,Total_Estimated_Cost__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c,
                RFP_Received_Date__c, ROM_Received_Date__c, RFP_Requested_Date__c, ROM_Requested_Date__c 
                FROM OCEAN_Request__c WHERE Id=:oceanRequestId];
            exportDataMap.put('Request Background Information', oceanReqList);

        List<SObject> ec2List = [SELECT Name,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c, AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Estimated_Cost__c,Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =: oceanRequestId ORDER BY  CreatedDate];      
            exportDataMap.put('EC2',ec2List);

        List<SObject> ebsList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Region__c,Calculated_Cost__c,Environment__c,Estimated_Cost__c,Estimated_Monthly_Cost__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Wave_Submitted__c,AWS_Accounts__r.Name FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('EBS',ebsList);

        List<SObject> s3List = [SELECT Name, ADO_Notes__c,Ocean_Request_Id__c, Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Data_Retrieval_GBMonth__c,Data_Retrieval_Type__c,Resource_Status__c,Environment__c,Estimated_Monthly_Cost__c,GETSELECT_and_Other_Requests__c,Total_Storage_GBMonth__c,Number_of_Lifecycle_Transition_Requests__c,Number_of_Months_Requested__c,Objects_Monitored_per_Month__c,Storage_Not_Accessed_in_30_Days__c,PUTCOPYPOSTLIST_Requests__c,Storage_Type__c,Total_Estimated_Cost__c 
                                FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('S3',s3List);

        List<SObject> vpcList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Tenancy__c,Calculated_Cost__c,Resource_Status__c,Environment__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('VPC',vpcList);

        List<SObject> efsList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('EFS',efsList);

        List<SObject> rdsList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Availability_Zone__c,AWS_Region__c,DB_Engine_License__c,Deployment__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,InstanceType__c,Number_of_Months_Requested__c,Storage_Type__c,Per_Instance_Uptime_DaysMonth__c,Per_Instance_Uptime_HoursDay__c,Provisioned_IOPS__c,Resource_Status__c,Storage_Size_GB__c,Total_Estimated_Cost__c,Wave_Submitted__c 
                                FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('RDS',rdsList);

        List<SObject> rdsbackupList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c, Additional_Backup_Storage_GB_Per_Month__c,Backup_Storage_Type__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('RDS Backup Storage',rdsbackupList);
        
        List<SObject> elbList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Environment__c,Calculated_Cost__c,Estimated_Monthly_Cost__c,Load_Balancing_Type__c,Data_Processed_per_Load_Balancer__c,Number_Load_Balancers__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('ELB',elbList);

        List<SObject> emrList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Hadoop_Distribution__c,Calculated_Cost__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,Instance_Type__c,Number_of_Months_Requested__c,Uptime_DaysMonth__c,Uptime_HoursDay__c,Resource_Status__c,Total_Estimated_Cost__c,Wave_Submitted__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('EMR',emrList);

        List<SObject> lambdaList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c, Calculated_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,
                                    Estimated_Execution_Time_ms__c, Number_of_Executions_per_Month__c, Allocated_Memory_MB__c
                                    FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('Lambda',lambdaList);

        List<SObject> quicksightList = [SELECT Name, ADO_Notes__c, Application_Component__c, AWS_Accounts__r.Name, AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,No_of_Sessions_per_UserMonth__c,Number_of_Months_Requested__c,Resource_Status__c, Calculated_Cost__c,Total_Estimated_Cost__c, User_Type__c, No_of_Users__c, Subscription_Model__c
                                        FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('Quicksight',quicksightList);

        List<SObject> dynamodbList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Capacity_Type__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Read_Capacity_Units_per_Month__c,Read_Consistency__c,Reservation_Term__c,Total_Data_Storage_GBMonth__c,Write_Capacity_Units_per_Month__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('DynamoDB',dynamodbList);                          

        List<SObject> dataTransferList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Data_Transfer_Amount_GBMonth__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Data_Transfer_Type__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('Data Transfer',dataTransferList);

        List<SObject> wkspaceList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Additional_Storage_per_User_GB__c,Billing_Options__c,License__c,Number_of_Workspaces__c,Root_Volume_User_Volume__c,Workspace_Bundle__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('Workspaces',wkspaceList);

        List<SObject> redshiftList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Funding_Type__c,Node_Quantity__c,Redshift_Type__c,Usage_Hours_Per_Day__c, Usage_Hours_Per_Month__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('Redshift',redshiftList);

        List<SObject> otherList = [SELECT Name, Resource_Status__c,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Total_Estimated_Cost__c,AWS_Service__c,Quantity__c,Unit__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            exportDataMap.put('Other Service',otherList);

        return exportDataMap;
    }
    
}
