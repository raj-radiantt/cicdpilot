public with sharing class OceanExport {
    @AuraEnabled
    public static Map<String,List<Object>> getDataForExport(String oceanRequestId){
        Map<String,List<Object>> exportDataMap = new Map<String,List<Object>>();
        //Request Background Info
        List<OCEAN_Request__c> oceanReqList = new List<OCEAN_Request__c>();
        oceanReqList = [SELECT Name, Request_Status__c, 
        ADO_Name__r.Name, ApplicationName__r.Name,ApplicationName__r.Application_Acronym__c, ApplicationName__r.Project_Acronym__r.Name, ApplicationName__r.Project_Acronym__r.Project_Number__c,Ocean_Wave__r.Name,Ocean_Wave__r.CSP_Option_Year__r.Name,Ocean_Wave__r.CSP_Option_Year__r.Option_Year_Start_Date__c,Ocean_Wave__r.CSP_Option_Year__r.Option_Year_End_Date__c,Ocean_Wave__r.CSP_Option_Year__r.Remaining_Months_in_OY__c,AWSInstances__c,Assumptions__c, CreatedDate, Submitted_Date__c
                FROM OCEAN_Request__c WHERE Id=:oceanRequestId];

        List<OceanExportRequestWrapper> reqWrapperList = new List<OceanExportRequestWrapper>();
        For(OCEAN_Request__c req : oceanReqList ){
            OceanExportRequestWrapper reqWrapper = new OceanExportRequestWrapper();
            reqWrapper.RequestId = req.Name;
            reqWrapper.RequestStatus = req.Request_Status__c;
            reqWrapper.AwsInstances = req.AWSInstances__c;
            reqWrapper.Assumptions = req.Assumptions__c.replaceAll('<[^>]+>','');
            reqWrapper.CreatedDate = String.valueOf(req.CreatedDate);
            reqWrapper.SubmittedDate = String.valueOf(req.Submitted_Date__c);
            reqWrapper.AppName = req.ApplicationName__r.Name;
            reqWrapper.AppAcronym = req.ApplicationName__r.Application_Acronym__c;
            reqWrapper.AdoName = req.ADO_Name__r.Name;
            reqWrapper.ProjectName = req.ApplicationName__r.Project_Acronym__r.Name;
            reqWrapper.ProjectNumber = req.ApplicationName__r.Project_Acronym__r.Project_Number__c;
            reqWrapper.WaveName = req.Ocean_Wave__r.Name;
            reqWrapper.OptionYear = req.Ocean_Wave__r.CSP_Option_Year__r.Name;
            reqWrapper.OptionYearStartDate = String.valueOf(req.Ocean_Wave__r.CSP_Option_Year__r.Option_Year_Start_Date__c);
            reqWrapper.OptionYearEndDate = String.valueOf(req.Ocean_Wave__r.CSP_Option_Year__r.Option_Year_End_Date__c);
            reqWrapper.RemainingMonthsInOY = req.Ocean_Wave__r.CSP_Option_Year__r.Remaining_Months_in_OY__c;
            reqWrapperList.add(reqWrapper);
        }
        exportDataMap.put('Request Background Information', reqWrapperList);

        // EC2
        List<OCEAN_Ec2Instance__c> ec2List = [SELECT Name,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c, AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =: oceanRequestId ORDER BY  CreatedDate];      
            List<OceanExportEc2Wrapper> ec2WrapperList = new List<OceanExportEc2Wrapper>();
            for(OCEAN_Ec2Instance__c ec2 : ec2List){
                OceanExportEc2Wrapper ec2Wrapper = new OceanExportEc2Wrapper();
                ec2Wrapper.EC2Id = ec2.Name;
                ec2Wrapper.AWSAccount = ec2.AWS_Accounts__r.Name;
                ec2Wrapper.ResourceStatus = ec2.Resource_Status__c;
                ec2Wrapper.AppComponent = ec2.Application_Component__c;
                ec2Wrapper.Environment = ec2.Environment__c;
                ec2Wrapper.Platform = ec2.Platform__c;
                ec2Wrapper.ADONotes = ec2.ADO_Notes__c;
                ec2Wrapper.Tenacy = ec2.Tenancy__c;
                ec2Wrapper.AWSRegion = ec2.AWS_Region__c;
                ec2Wrapper.BillingOption = ec2.ADO_FUNDING_TYPE__c;
                ec2Wrapper.InstanceQuantity = ec2.Instance_Quantity__c;
                ec2Wrapper.InstanceType = ec2.EC2_Instance_Type__c;
                ec2Wrapper.NoOfMonthsRequested = ec2.Per_Instance_Running_Months_in_Remaining__c;
                ec2Wrapper.AWSAvailabilityZone = ec2.AWS_Availability_Zone__c;
                ec2Wrapper.InstanceHoursPerDay = ec2.PerInstanceUptimePerDay__c;
                ec2Wrapper.InstanceDaysPerMonth = ec2.PerInstanceUptimePerMonth__c;
                ec2Wrapper.CalculatedCost = ec2.Calculated_Cost__c;
                ec2WrapperList.add(ec2Wrapper);
            }
            exportDataMap.put('EC2',ec2WrapperList);

        //EBS
        List<Ocean_Ebs_Storage__c> ebsList = [SELECT Name, AWS_Accounts__r.Name,ADO_Notes__c,Application_Component__c,AWS_Region__c,Calculated_Cost__c,Environment__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Snapshot_Frequency__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportEBSWrapper> ebsWrapperList = new List<OceanExportEBSWrapper>();
            For(Ocean_Ebs_Storage__c ebs : ebsList){
                OceanExportEBSWrapper ebsWrapper = new OceanExportEBSWrapper();
                ebsWrapper.EBSId = ebs.Name;
                ebsWrapper.AWSAccount = ebs.AWS_Accounts__r.Name;
                ebsWrapper.ResourceStatus = ebs.Resource_Status__c;
                ebsWrapper.AppComponent = ebs.Application_Component__c;
                ebsWrapper.AWSRegion = ebs.AWS_Region__c;
                ebsWrapper.ADONotes = ebs.ADO_Notes__c;
                ebsWrapper.Environment = ebs.Environment__c;
                ebsWrapper.IOPS = ebs.IOPS__c;
                ebsWrapper.NoOfVolumes = ebs.Number_of_Volumes__c;
                ebsWrapper.VolumeType = ebs.Volume_Type__c;
                ebsWrapper.NoOfMonthsRequested = ebs.Number_of_Months_Requested__c;
                ebsWrapper.StorageSize = ebs.Storage_Size_GB__c;
                ebsWrapper.SnapshotFrequency = ebs.Snapshot_Frequency__c;
                ebsWrapper.SnapshotStorage = ebs.Snapshot_Storage_GB_Per_Month__c;
                ebsWrapper.CalculatedCost = ebs.Calculated_Cost__c;
                ebsWrapperList.add(ebsWrapper);
            }
            exportDataMap.put('EBS',ebsWrapperList);

        //S3
        List<Ocean_S3_Request__c> s3List = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Data_Retrieval_GBMonth__c,Data_Retrieval_Type__c,Resource_Status__c,Environment__c,GETSELECT_and_Other_Requests__c,Total_Storage_GBMonth__c,Number_of_Lifecycle_Transition_Requests__c,Number_of_Months_Requested__c,Objects_Monitored_per_Month__c,Storage_Not_Accessed_in_30_Days__c,PUTCOPYPOSTLIST_Requests__c,Storage_Type__c 
        FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportS3Wrapper> s3WrapperList = new List<OceanExportS3Wrapper>();
            For(Ocean_S3_Request__c s3 : s3List){
                OceanExportS3Wrapper s3Wrapper = new OceanExportS3Wrapper();
                s3Wrapper.S3Id = s3.Name;
                s3Wrapper.ResourceStatus = s3.Resource_Status__c;
                s3Wrapper.AppComponent = s3.Application_Component__c;
                s3Wrapper.Environment = s3.Environment__c;
                s3Wrapper.AWSAccount = s3.AWS_Accounts__r.Name;
                s3Wrapper.AWSRegion = s3.AWS_Region__c;
                s3Wrapper.NoOfMonthsRequested = s3.Number_of_Months_Requested__c;
                s3Wrapper.NoOfObjectsMonitoredMonth = s3.Objects_Monitored_per_Month__c;
                s3Wrapper.NoOfLifecycleTransitionRequests =  s3.Number_of_Lifecycle_Transition_Requests__c;
                s3Wrapper.DataRetrievalType = s3.Data_Retrieval_Type__c;
                s3Wrapper.DataRetrievalGBMonth = s3.Data_Retrieval_GBMonth__c;
                s3Wrapper.StorageType = s3.Storage_Type__c;
                s3Wrapper.TotalStorage = s3.Total_Storage_GBMonth__c;
                s3Wrapper.PercentStorageNotAccessed30Days = s3.Storage_Not_Accessed_in_30_Days__c;
                s3Wrapper.PUTCOPYPOSTLISTRequests = s3.PUTCOPYPOSTLIST_Requests__c;
                s3Wrapper.GETSELECTOtherRequests = s3.GETSELECT_and_Other_Requests__c;
                s3Wrapper.ADONotes = s3.ADO_Notes__c;
                s3Wrapper.CalculatedCost = s3.Calculated_Cost__c;
                s3WrapperList.add(s3Wrapper);
            }
            exportDataMap.put('S3',s3WrapperList);

        //VPC
        List<Ocean_Vpc_Request__c> vpcList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Tenancy__c,Calculated_Cost__c,Resource_Status__c,Environment__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportVPCWrapper> vpcWrapperList = new List<OceanExportVPCWrapper>();
            For(Ocean_Vpc_Request__c vpc : vpcList){
                OceanExportVPCWrapper vpcWrapper = new OceanExportVPCWrapper();
                vpcWrapper.VPCId = vpc.Name;
                vpcWrapper.AWSAccount = vpc.AWS_Accounts__r.Name;
                vpcWrapper.AppComponent = vpc.Application_Component__c;
                vpcWrapper.ResourceStatus = vpc.Resource_Status__c;               
                vpcWrapper.Environment = vpc.Environment__c;
                vpcWrapper.AWSRegion = vpc.AWS_Region__c;
                vpcWrapper.NoOfVPCs = vpc.Number_of_VPCs__c;
                vpcWrapper.Tenacy = vpc.Tenancy__c;
                vpcWrapper.ADONotes = vpc.ADO_Notes__c;
                vpcWrapper.CalculatedCost = vpc.Calculated_Cost__c;
                vpcWrapperList.add(vpcWrapper);
            }
            exportDataMap.put('VPC',vpcWrapperList);

        //EFS
        List<Ocean_EFS_Request__c> efsList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportEFSWrapper> efsWrapperList = new List<OceanExportEFSWrapper>();
            For(Ocean_EFS_Request__c efs : efsList){
                OceanExportEFSWrapper efsWrapper = new OceanExportEFSWrapper();
                efsWrapper.EFSId = efs.Name;
                efsWrapper.AWSAccount = efs.AWS_Accounts__r.Name;
                efsWrapper.AppComponent = efs.Application_Component__c;
                efsWrapper.ResourceStatus = efs.Resource_Status__c;
                efsWrapper.Environment = efs.Environment__c;
                efsWrapper.AWSRegion = efs.AWS_Region__c;
                efsWrapper.StorageType = efs.Storage_Type__c;
                efsWrapper.TotalStorage = efs.Total_Data_Storage_GBMonth__c;
                efsWrapper.ProvisionedThroughput = efs.Provisioned_Throughput_MBps__c;
                efsWrapper.InfrequentAccessRequests = efs.Infrequent_Access_Requests_GB__c;
                efsWrapper.NoOfMonthsRequested = efs.Number_of_Months_Requested__c;
                efsWrapper.ADONotes = efs.ADO_Notes__c;
                efsWrapper.CalculatedCost = efs.Calculated_Cost__c;
                efsWrapperList.add(efsWrapper);
            }
            exportDataMap.put('EFS',efsWrapperList);

        //RDS
        List<Ocean_RDS_Request__c> rdsList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Availability_Zone__c,AWS_Region__c,DB_Engine_License__c,Deployment__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,InstanceType__c,Number_of_Months_Requested__c,Storage_Type__c,Per_Instance_Uptime_DaysMonth__c,Per_Instance_Uptime_HoursDay__c,Provisioned_IOPS__c,Resource_Status__c,Storage_Size_GB__c 
        FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportRDSWrapper> rdsWrapperList = new List<OceanExportRDSWrapper>();
            For(Ocean_RDS_Request__c rds : rdsList){
               OceanExportRDSWrapper rdsWrapper = new OceanExportRDSWrapper(); 
               rdsWrapper.RDSId = rds.Name;
               rdsWrapper.AWSAccount = rds.AWS_Accounts__r.Name;
               rdsWrapper.ResourceStatus = rds.Resource_Status__c;
               rdsWrapper.AppComponent = rds.Application_Component__c;
               rdsWrapper.Environment = rds.Environment__c;
               rdsWrapper.AWSRegion = rds.AWS_Region__c;
               rdsWrapper.Deployment = rds.Deployment__c;
               rdsWrapper.AvailabilityZone = rds.AWS_Availability_Zone__c;
               rdsWrapper.InstanceQuantity = rds.Instance_Quantity__c;
               rdsWrapper.InstanceType = rds.InstanceType__c;
               rdsWrapper.DBEngineAndLicense = rds.DB_Engine_License__c;
               rdsWrapper.StorageSize = rds.Storage_Size_GB__c;
               rdsWrapper.StorageType = rds.Storage_Type__c;
               rdsWrapper.ProvisionedIOPS = rds.Provisioned_IOPS__c;
               rdsWrapper.InstanceUptimeHoursPerDay = rds.Per_Instance_Uptime_HoursDay__c;
               rdsWrapper.InstanceUptimeDaysPerMonth = rds.Per_Instance_Uptime_DaysMonth__c;
               rdsWrapper.NoOfMonthsRequested = rds.Number_of_Months_Requested__c;
               rdsWrapper.FundingType = rds.Funding_Type__c;
               rdsWrapper.ADONotes = rds.ADO_Notes__c;
               rdsWrapper.CalculatedCost = rds.Calculated_Cost__c;
               rdsWrapperList.add(rdsWrapper);
            }
            exportDataMap.put('RDS',rdsWrapperList);

        //RDSBackup
        List<Ocean_RDS_Backup_Request__c> rdsbackupList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c, Additional_Backup_Storage_GB_Per_Month__c,Backup_Storage_Type__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportRDSBkupWrapper> rdsBkupWrapperList = new List<OceanExportRDSBkupWrapper>();
            For(Ocean_RDS_Backup_Request__c rdsBkup : rdsbackupList){
                OceanExportRDSBkupWrapper rdsBkupWrapper = new OceanExportRDSBkupWrapper();
                rdsBkupWrapper.RDSBkupId = rdsBkup.Name;
                rdsBkupWrapper.AWSAccount = rdsBkup.AWS_Accounts__r.Name;
                rdsBkupWrapper.ResourceStatus = rdsBkup.Resource_Status__c;
                rdsBkupWrapper.AppComponent = rdsBkup.Application_Component__c;
                rdsBkupWrapper.Environment = rdsBkup.Environment__c;
                rdsBkupWrapper.AWSRegion = rdsBkup.AWS_Region__c;
                rdsBkupWrapper.BackupStorage = rdsBkup.Backup_Storage_Type__c;
                rdsBkupWrapper.AdditionalBackup = rdsBkup.Additional_Backup_Storage_GB_Per_Month__c;
                rdsBkupWrapper.NoOfMonthsRequested = rdsBkup.Number_of_Months_Requested__c;
                rdsBkupWrapper.ADONotes = rdsBkup.ADO_Notes__c;
                rdsBkupWrapper.CalculatedCost = rdsBkup.Calculated_Cost__c;
                rdsBkupWrapperList.add(rdsBkupWrapper);
            }
            exportDataMap.put('RDS Backup Storage',rdsBkupWrapperList);
        
        //ELB
        List<Ocean_ELB_Request__c> elbList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Environment__c,Calculated_Cost__c,Estimated_Monthly_Cost__c,Load_Balancing_Type__c,Data_Processed_per_Load_Balancer__c,Number_Load_Balancers__c,Number_of_Months_Requested__c,Resource_Status__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportELBWrapper> elbWrapperList = new List<OceanExportELBWrapper>();
            For(Ocean_ELB_Request__c elb : elbList) {
                OceanExportELBWrapper elbWrapper = new OceanExportELBWrapper();
                elbWrapper.ELBId = elb.Name;
                elbWrapper.AWSAccount = elb.AWS_Accounts__r.Name;
                elbWrapper.ResourceStatus = elb.Resource_Status__c;
                elbWrapper.AppComponent = elb.Application_Component__c;
                elbWrapper.Environment = elb.Environment__c;
                elbWrapper.AWSRegion = elb.AWS_Region__c;
                elbWrapper.NoOfLoadBalancers = elb.Number_Load_Balancers__c;
                elbWrapper.DataProcessed = elb.Data_Processed_per_Load_Balancer__c;
                elbWrapper.NoOfMonthsRequested = elb.Number_of_Months_Requested__c;
                elbWrapper.ADONotes = elb.ADO_Notes__c;
                elbWrapperList.add(elbWrapper);
            }
            exportDataMap.put('ELB',elbWrapperList);

        //EMR
        List<Ocean_EMR_Request__c> emrList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Hadoop_Distribution__c,Calculated_Cost__c,Environment__c,Funding_Type__c,Instance_Quantity__c,Instance_Type__c,Number_of_Months_Requested__c,Uptime_DaysMonth__c,Uptime_HoursDay__c,Resource_Status__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportEMRWrapper> emrWrapperList = new List<OceanExportEMRWrapper>();
            For(Ocean_EMR_Request__c emr : emrList){
                OceanExportEMRWrapper emrWrapper = new OceanExportEMRWrapper();
                emrWrapper.EMRId = emr.Name;
                emrWrapper.AWSAccount = emr.AWS_Accounts__r.Name;
                emrWrapper.ResourceStatus = emr.Resource_Status__c;
                emrWrapper.AppComponent = emr.Application_Component__c;
                emrWrapper.Environment = emr.Environment__c;
                emrWrapper.AWSRegion = emr.AWS_Region__c;
                emrWrapper.InstanceQuantity = emr.Instance_Quantity__c;
                emrWrapper.InstanceType = emr.Instance_Type__c;
                emrWrapper.HadoopDistribution = emr.Hadoop_Distribution__c;
                emrWrapper.NoOfMonthsRequested = emr.Number_of_Months_Requested__c;
                emrWrapper.UptimeHoursPerDay = emr.Uptime_HoursDay__c;
                emrWrapper.UptimeDaysPerMonth = emr.Uptime_DaysMonth__c;
                emrWrapper.FundingType = emr.Funding_Type__c;
                emrWrapper.ADONotes = emr.ADO_Notes__c;
                emrWrapper.CalculatedCost = emr.Calculated_Cost__c;
                emrWrapperList.add(emrWrapper);
            }
            exportDataMap.put('EMR',emrWrapperList);

        //LAMBDA
        List<Ocean_Lambda__c> lambdaList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Environment__c, Calculated_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Estimated_Execution_Time_ms__c, Number_of_Executions_per_Month__c, Allocated_Memory_MB__c
        FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportLambdaWrapper> lambdaWrapperList = new List<OceanExportLambdaWrapper>();
            For(Ocean_Lambda__c lambda : lambdaList){
                OceanExportLambdaWrapper lambdaWrapper = new OceanExportLambdaWrapper();
                lambdaWrapper.LambdaId = lambda.Name;
                lambdaWrapper.AWSAccount = lambda.AWS_Accounts__r.Name;
                lambdaWrapper.ResourceStatus = lambda.Resource_Status__c;
                lambdaWrapper.AppComponent = lambda.Application_Component__c;
                lambdaWrapper.Environment = lambda.Environment__c;
                lambdaWrapper.AWSRegion = lambda.AWS_Region__c;
                lambdaWrapper.NoOfExecutions = lambda.Number_of_Executions_per_Month__c;
                lambdaWrapper.EstimatedExecution = lambda.Estimated_Execution_Time_ms__c;
                lambdaWrapper.AllocatedMemory = lambda.Allocated_Memory_MB__c;
                lambdaWrapper.NoOfMonthsRequested = lambda.Number_of_Months_Requested__c;
                lambdaWrapper.ADONotes = lambda.ADO_Notes__c;
                lambdaWrapper.CalculatedCost = lambda.Calculated_Cost__c;
                lambdaWrapperList.add(lambdaWrapper);
            }
            exportDataMap.put('Lambda',lambdaWrapperList);

        //QuickSight
        List<Ocean_QuickSight_Request__c> quicksightList = [SELECT Name, ADO_Notes__c, Application_Component__c, AWS_Accounts__r.Name, AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,No_of_Sessions_per_UserMonth__c,Number_of_Months_Requested__c,Resource_Status__c, Calculated_Cost__c,Total_Estimated_Cost__c, User_Type__c, No_of_Users__c, Subscription_Model__c
        FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportQSWrapper> qsWrapperList = new List<OceanExportQSWrapper>();
            For(Ocean_QuickSight_Request__c qs : quicksightList) {
                OceanExportQSWrapper qsWrapper = new OceanExportQSWrapper();
                qsWrapper.QSId = qs.Name;
                qsWrapper.AWSAccount = qs.AWS_Accounts__r.Name;
                qsWrapper.ResourceStatus = qs.Resource_Status__c;
                qsWrapper.AppComponent = qs.Application_Component__c;
                qsWrapper.Environment = qs.Environment__c;
                qsWrapper.AWSRegion = qs.AWS_Region__c;
                qsWrapper.NoOfUsers = qs.No_of_Users__c;
                qsWrapper.UserType = qs.User_Type__c;
                qsWrapper.SubModel = qs.Subscription_Model__c;
                qsWrapper.NoOfSessions = qs.No_of_Sessions_per_UserMonth__c;
                qsWrapper.NoOfMonthsRequested = qs.Number_of_Months_Requested__c;
                qsWrapper.ADONotes = qs.ADO_Notes__c;
                qsWrapper.CalculatedCost = qs.Calculated_Cost__c;
            }
            exportDataMap.put('Quicksight',quicksightList);

        //DynamoDB
        List<Ocean_DynamoDB_Request__c> dynamodbList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Capacity_Type__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Read_Capacity_Units_per_Month__c,Read_Consistency__c,Reservation_Term__c,Total_Data_Storage_GBMonth__c,Write_Capacity_Units_per_Month__c,Resource_Status__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportDynamoDBWrapper> dynamoWrapperList = new List<OceanExportDynamoDBWrapper>();
            For(Ocean_DynamoDB_Request__c dynamo : dynamodbList){
                OceanExportDynamoDBWrapper dynamoWrapper = new OceanExportDynamoDBWrapper();
                dynamoWrapper.DynamoId = dynamo.Name;
                dynamoWrapper.AWSAccount = dynamo.AWS_Accounts__r.Name;
                dynamoWrapper.ResourceStatus = dynamo.Resource_Status__c;
                dynamoWrapper.AppComponent = dynamo.Application_Component__c;
                dynamoWrapper.Environment = dynamo.Environment__c;
                dynamoWrapper.AWSRegion = dynamo.AWS_Region__c;
                dynamoWrapper.CapacityType = dynamo.Capacity_Type__c;
                dynamoWrapper.TotalDataStorage = dynamo.Total_Data_Storage_GBMonth__c;
                dynamoWrapper.ReadCapacity = dynamo.Read_Capacity_Units_per_Month__c;
                dynamoWrapper.WriteCapacity = dynamo.Write_Capacity_Units_per_Month__c;
                dynamoWrapper.NoOfMonthsRequested = dynamo.Number_of_Months_Requested__c;
                dynamoWrapper.ADONotes = dynamo.ADO_Notes__c;
                dynamoWrapper.CalculatedCost = dynamo.Calculated_Cost__c;
                dynamoWrapperList.add(dynamoWrapper);
            }
            exportDataMap.put('DynamoDB',dynamoWrapperList);                          

        //DataTransfer
        List<Ocean_DataTransfer_Request__c> dataTransferList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Data_Transfer_Amount_GBMonth__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Data_Transfer_Type__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportDTWrapper> dtWrapperList = new List<OceanExportDTWrapper>();
            For(Ocean_DataTransfer_Request__c dt : dataTransferList){
                OceanExportDTWrapper dtWrapper = new OceanExportDTWrapper();
                dtWrapper.DTId = dt.Name;
                dtWrapper.AWSAccount = dt.AWS_Accounts__r.Name;
                dtWrapper.ResourceStatus = dt.Resource_Status__c;
                dtWrapper.AppComponent = dt.Application_Component__c;
                dtWrapper.Environment = dt.Environment__c;
                dtWrapper.AWSRegion = dt.AWS_Region__c;
                dtWrapper.DataTransferType = dt.Data_Transfer_Type__c;
                dtWrapper.DataTransferAmount = dt.Data_Transfer_Amount_GBMonth__c;
                dtWrapper.NoOfMonthsRequested = dt.Number_of_Months_Requested__c;
                dtWrapper.ADONotes = dt.ADO_Notes__c;
                dtWrapper.CalculatedCost = dt.Calculated_Cost__c;
                dtWrapperList.add(dtWrapper);         
            }
            exportDataMap.put('Data Transfer',dtWrapperList);

        //Workspace
        List<Ocean_Workspaces_Request__c> wkspaceList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Additional_Storage_per_User_GB__c,Billing_Options__c,License__c,Number_of_Workspaces__c,Root_Volume_User_Volume__c,Workspace_Bundle__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportWSWrapper> wsWrapperList = new List<OceanExportWSWrapper>();
            For(Ocean_Workspaces_Request__c ws : wkspaceList){
                OceanExportWSWrapper wsWrapper = new OceanExportWSWrapper(); 
                wsWrapper.WSId = ws.Name;
                wsWrapper.AWSAccount = ws.AWS_Accounts__r.Name;
                wsWrapper.ResourceStatus = ws.Resource_Status__c;
                wsWrapper.AppComponent = ws.Application_Component__c;
                wsWrapper.Environment = ws.Environment__c;
                wsWrapper.AWSRegion = ws.AWS_Region__c;
                wsWrapper.NoOfWorkspace = ws.Number_of_Workspaces__c;
                wsWrapper.WorkspaceBundle = ws.Workspace_Bundle__c;
                wsWrapper.License = ws.License__c;
                wsWrapper.RootUserVolume = ws.Root_Volume_User_Volume__c;
                wsWrapper.BillingOption = ws.Billing_Options__c;
                wsWrapper.AdditionalStorage = ws.Additional_Storage_per_User_GB__c;
                wsWrapper.NoOfMonthsRequested = ws.Number_of_Months_Requested__c;
                wsWrapper.ADONotes = ws.ADO_Notes__c;
                wsWrapper.CalculatedCost = ws.Calculated_Cost__c;
                wsWrapperList.add(wsWrapper);   
            }
            exportDataMap.put('Workspaces',wsWrapperList);

        //Redshift
        List<Ocean_Redshift_Request__c> redshiftList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Funding_Type__c,Node_Quantity__c,Redshift_Type__c,Usage_Hours_Per_Day__c, Usage_Hours_Per_Month__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportRSWrapper> rsWrapperList = new List<OceanExportRSWrapper>();
            for(Ocean_Redshift_Request__c rs : redshiftList){
                OceanExportRSWrapper rsWrapper = new OceanExportRSWrapper();
                rsWrapper.RSId = rs.Name;
                rsWrapper.AWSAccount = rs.AWS_Accounts__r.Name;
                rsWrapper.ResourceStatus = rs.Resource_Status__c;
                rsWrapper.AppComponent = rs.Application_Component__c;
                rsWrapper.Environment = rs.Environment__c;
                rsWrapper.AWSRegion = rs.AWS_Region__c;
                rsWrapper.NodeType = rs.Redshift_Type__c;
                rsWrapper.NodeQuantity = rs.Node_Quantity__c;
                rsWrapper.UsageHoursPerDay = rs.Usage_Hours_Per_Day__c;
                rsWrapper.UsageDaysPerMonth = rs.Usage_Hours_Per_Month__c;
                rsWrapper.NoOfMonthsRequested = rs.Number_of_Months_Requested__c;
                rsWrapper.ADONotes = rs.ADO_Notes__c;
                rsWrapper.CalculatedCost = rs.Calculated_Cost__c;
                rsWrapperList.add(rsWrapper);
            }
            exportDataMap.put('Redshift',rsWrapperList);

        //OtherService
        List<Ocean_Other_Request__c> otherList = [SELECT Name, Resource_Status__c,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c, Number_of_Months_Requested__c,Total_Estimated_Cost__c,AWS_Service__c,Quantity__c,Unit__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<OceanExportOtherWrapper> otherWrapperList = new List<OceanExportOtherWrapper>();
            for(Ocean_Other_Request__c other : otherList) {
                OceanExportOtherWrapper otherWrapper = new OceanExportOtherWrapper();
                otherWrapper.OtherId = other.Name;
                otherWrapper.AWSAccount = other.AWS_Accounts__r.Name;
                otherWrapper.ResourceStatus = other.Resource_Status__c;
                otherWrapper.AppComponent = other.Application_Component__c;
                otherWrapper.Environment = other.Environment__c;
                otherWrapper.AWSRegion = other.AWS_Region__c;
                otherWrapper.AWSService = other.AWS_Service__c;
                otherWrapper.Quantity = other.Quantity__c;
                otherWrapper.Unit = other.Unit__c;
                otherWrapper.NoOfMonthsRequested = other.Number_of_Months_Requested__c;
                otherWrapper.ADONotes = other.ADO_Notes__c;
                otherWrapper.CalculatedCost = other.Calculated_Cost__c;
                otherWrapperList.add(otherWrapper);    
            }
            exportDataMap.put('Other Service',otherWrapperList);

        return exportDataMap;
    }
    
}
