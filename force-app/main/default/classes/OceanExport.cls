public with sharing class OceanExport {
    @AuraEnabled
    public static Map<String,List<List<Object>>> getDataForExport(String oceanRequestId){
        Map<String,List<List<Object>>> exportDataMap = new Map<String,List<List<Object>>>();
        //Request Background Info
        List<OCEAN_Request__c> oceanReqList = new List<OCEAN_Request__c>();
        oceanReqList = [SELECT Name, Request_Status__c, 
        ADO_Name__r.Name, ApplicationName__r.Name,ApplicationName__r.Application_Acronym__c, ApplicationName__r.Project_Acronym__r.Name, ApplicationName__r.Project_Acronym__r.Project_Number__c,Ocean_Wave__r.Name,Ocean_Wave__r.CSP_Option_Year__r.Name,Ocean_Wave__r.CSP_Option_Year__r.Option_Year_Start_Date__c,Ocean_Wave__r.CSP_Option_Year__r.Option_Year_End_Date__c,Ocean_Wave__r.CSP_Option_Year__r.Remaining_Months_in_OY__c,AWSInstances__c,Assumptions__c, CreatedDate, Submitted_Date__c
                FROM OCEAN_Request__c WHERE Id=:oceanRequestId];

        List<List<OceanOrderedProperty>> reqWrapperList = new List<List<OceanOrderedProperty>>();
        For(OCEAN_Request__c req : oceanReqList ){
            List<OceanOrderedProperty> reqPropertyList = new List<OceanOrderedProperty>();
            reqPropertyList.add(new OceanOrderedProperty(0,'Request Id',req.Name));
            reqPropertyList.add(new OceanOrderedProperty(1,'Request Status',req.Request_Status__c));
            reqPropertyList.add(new OceanOrderedProperty(2,'AWS Instances',req.AWSInstances__c));
            reqPropertyList.add(new OceanOrderedProperty(3,'Asssumptions',string.isBlank(req.Assumptions__c)?'':req.Assumptions__c.replaceAll('<[^>]+>','')));
            reqPropertyList.add(new OceanOrderedProperty(4,'Created Date',String.valueOf(req.CreatedDate)));
            reqPropertyList.add(new OceanOrderedProperty(5,'Submitted Date',String.valueOf(req.Submitted_Date__c)));
            reqPropertyList.add(new OceanOrderedProperty(6,'App Name',req.ApplicationName__r.Name));
            reqPropertyList.add(new OceanOrderedProperty(7,'App Acronym',req.ApplicationName__r.Application_Acronym__c));
            reqPropertyList.add(new OceanOrderedProperty(8,'ADO Name',req.ADO_Name__r.Name));
            reqPropertyList.add(new OceanOrderedProperty(9,'Project Name',req.ApplicationName__r.Project_Acronym__r.Name));
            reqPropertyList.add(new OceanOrderedProperty(10,'Project Number',req.ApplicationName__r.Project_Acronym__r.Project_Number__c));
            reqPropertyList.add(new OceanOrderedProperty(11,'Wave Name',req.Ocean_Wave__r.Name));
            reqPropertyList.add(new OceanOrderedProperty(12,'Option Year',req.Ocean_Wave__r.CSP_Option_Year__r.Name));
            reqPropertyList.add(new OceanOrderedProperty(13,'OY Start Date',String.valueOf(req.Ocean_Wave__r.CSP_Option_Year__r.Option_Year_Start_Date__c)));
            reqPropertyList.add(new OceanOrderedProperty(14,'OY End Date',String.valueOf(req.Ocean_Wave__r.CSP_Option_Year__r.Option_Year_End_Date__c)));
            reqPropertyList.add(new OceanOrderedProperty(15,'Remaining Months in OY',String.valueOf(req.Ocean_Wave__r.CSP_Option_Year__r.Remaining_Months_in_OY__c)));

            reqWrapperList.add(reqPropertyList);
        }
        exportDataMap.put('Request Background Information', reqWrapperList);

        // EC2
        List<OCEAN_Ec2Instance__c> ec2List = [SELECT Name,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,AWS_Availability_Zone__c, AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =: oceanRequestId ORDER BY  CreatedDate];      
            List<List<OceanOrderedProperty>> ec2WrapperList = new List<List<OceanOrderedProperty>>();
            for(OCEAN_Ec2Instance__c ec2 : ec2List){
                List<OceanOrderedProperty> ec2PropertyList = new List<OceanOrderedProperty>();
                ec2PropertyList.add(new OceanOrderedProperty(0,'EC2 Id',ec2.Name));
                ec2PropertyList.add(new OceanOrderedProperty(1,'AWS Account',ec2.AWS_Accounts__r.Name));
                ec2PropertyList.add(new OceanOrderedProperty(2,'Resource Status',ec2.Resource_Status__c));
                ec2PropertyList.add(new OceanOrderedProperty(3,'App Component', ec2.Application_Component__c));
                ec2PropertyList.add(new OceanOrderedProperty(4,'Environment',ec2.Environment__c));
                ec2PropertyList.add(new OceanOrderedProperty(5,'AWS Region',ec2.AWS_Region__c));
                ec2PropertyList.add(new OceanOrderedProperty(6,'Platform',ec2.Platform__c));
                ec2PropertyList.add(new OceanOrderedProperty(7,'Tenacy',ec2.Tenancy__c));
                ec2PropertyList.add(new OceanOrderedProperty(8,'Instance Quantity',string.valueOf(ec2.Instance_Quantity__c)));
                ec2PropertyList.add(new OceanOrderedProperty(9,'Instance Type',ec2.EC2_Instance_Type__c));
                ec2PropertyList.add(new OceanOrderedProperty(10,'AWS Availability Zone',ec2.AWS_Availability_Zone__c));
                ec2PropertyList.add(new OceanOrderedProperty(11,'Remaining months',String.valueOf(ec2.Per_Instance_Running_Months_in_Remaining__c)));
                ec2PropertyList.add(new OceanOrderedProperty(12,'Uptime/Day',String.valueOf(ec2.PerInstanceUptimePerDay__c)));
                ec2PropertyList.add(new OceanOrderedProperty(13,'Uptime/Month',String.valueOf(ec2.PerInstanceUptimePerMonth__c)));
                ec2PropertyList.add(new OceanOrderedProperty(14,'Funding Type',ec2.ADO_FUNDING_TYPE__c));
                ec2PropertyList.add(new OceanOrderedProperty(15,'ADO Notes',ec2.ADO_Notes__c));
                ec2PropertyList.add(new OceanOrderedProperty(16,'Calculated Cost',string.valueOf(ec2.Calculated_Cost__c)));

                ec2WrapperList.add(ec2PropertyList);
            }
            exportDataMap.put('EC2',ec2WrapperList);

        //EBS
        List<Ocean_Ebs_Storage__c> ebsList = [SELECT Name, AWS_Accounts__r.Name,ADO_Notes__c,Average_duration__c,Application_Component__c,AWS_Region__c,Calculated_Cost__c,Environment__c,IOPS__c,Number_of_Months_Requested__c,Number_of_Volumes__c,Resource_Status__c,Snapshot_Storage_GB_Per_Month__c,Storage_Size_GB__c,Volume_Type__c,Snapshot_Frequency__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> ebsWrapperList = new List<List<OceanOrderedProperty>>();

            For(Ocean_Ebs_Storage__c ebs : ebsList){       
                List<OceanOrderedProperty> ebsPropertyList = new List<OceanOrderedProperty>();
                ebsPropertyList.add(new OceanOrderedProperty(0,'EBS Id',ebs.Name));
                ebsPropertyList.add(new OceanOrderedProperty(1,'AWS Account',ebs.AWS_Accounts__r.Name));
                ebsPropertyList.add(new OceanOrderedProperty(2,'Resource Status',ebs.Resource_Status__c));
                ebsPropertyList.add(new OceanOrderedProperty(3,'App Component',ebs.Application_Component__c));
                ebsPropertyList.add(new OceanOrderedProperty(4,'AWS Region',ebs.AWS_Region__c));
                ebsPropertyList.add(new OceanOrderedProperty(5,'Environment',ebs.Environment__c));
                ebsPropertyList.add(new OceanOrderedProperty(6,'IOPS',string.valueOf(ebs.IOPS__c)));
                ebsPropertyList.add(new OceanOrderedProperty(7,'Volume Type',ebs.Volume_Type__c));
                ebsPropertyList.add(new OceanOrderedProperty(8,'No of Volumes',string.valueOf(ebs.Number_of_Volumes__c)));
                ebsPropertyList.add(new OceanOrderedProperty(9,'Storage Size',string.valueOf(ebs.Storage_Size_GB__c)));
                ebsPropertyList.add(new OceanOrderedProperty(10,'Snapshot Storage',string.valueOf(ebs.Snapshot_Storage_GB_Per_Month__c)));
                ebsPropertyList.add(new OceanOrderedProperty(11,'Snapshot Frequency',ebs.Snapshot_Frequency__c));
                ebsPropertyList.add(new OceanOrderedProperty(12,'Average Duration',String.valueOf(ebs.Average_duration__c)));
                ebsPropertyList.add(new OceanOrderedProperty(13,'No of months requested',string.valueOf(ebs.Number_of_Months_Requested__c)));
                ebsPropertyList.add(new OceanOrderedProperty(14,'ADO Notes',ebs.ADO_Notes__c));
                ebsPropertyList.add(new OceanOrderedProperty(15,'Calculated Cost',string.valueOf(ebs.Calculated_Cost__c)));

                ebsWrapperList.add(ebsPropertyList);
            }
            exportDataMap.put('EBS',ebsWrapperList);

        //S3
        List<Ocean_S3_Request__c> s3List = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Data_Retrieval_GBMonth__c,Data_Retrieval_Type__c,Resource_Status__c,Environment__c,GETSELECT_and_Other_Requests__c,Total_Storage_GBMonth__c,Number_of_Lifecycle_Transition_Requests__c,Number_of_Months_Requested__c,Objects_Monitored_per_Month__c,Storage_Not_Accessed_in_30_Days__c,PUTCOPYPOSTLIST_Requests__c,Storage_Type__c 
        FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> s3WrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_S3_Request__c s3 : s3List){
                List<OceanOrderedProperty> s3PropertyList = new List<OceanOrderedProperty>();
                s3PropertyList.add(new OceanOrderedProperty(0,'S3 Id',s3.Name));
                s3PropertyList.add(new OceanOrderedProperty(1,'AWS Account',s3.AWS_Accounts__r.Name));
                s3PropertyList.add(new OceanOrderedProperty(2,'Resource Status',s3.Resource_Status__c));
                s3PropertyList.add(new OceanOrderedProperty(3,'App Component',s3.Application_Component__c));
                s3PropertyList.add(new OceanOrderedProperty(4,'Environment',s3.Environment__c));
                s3PropertyList.add(new OceanOrderedProperty(5,'AWS Region',s3.AWS_Region__c));
                s3PropertyList.add(new OceanOrderedProperty(6,'No of months requested',String.valueOf(s3.Number_of_Months_Requested__c)));               
                s3PropertyList.add(new OceanOrderedProperty(7,'Storage Type',s3.Storage_Type__c));
                s3PropertyList.add(new OceanOrderedProperty(8,'Total Storage',String.valueOf(s3.Total_Storage_GBMonth__c)));
                s3PropertyList.add(new OceanOrderedProperty(9,'PUT COPY',String.valueOf(s3.PUTCOPYPOSTLIST_Requests__c)));
                s3PropertyList.add(new OceanOrderedProperty(10,'GET SELECT',String.valueOf(s3.GETSELECT_and_Other_Requests__c)));
                s3PropertyList.add(new OceanOrderedProperty(11,'ADO Notes',s3.ADO_Notes__c));
                s3PropertyList.add(new OceanOrderedProperty(12,'Calculated Cost',String.valueOf(s3.Calculated_Cost__c)));

                s3WrapperList.add(s3PropertyList);
            }
        exportDataMap.put('S3',s3WrapperList);

        //VPC
        List<Ocean_Vpc_Request__c> vpcList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Tenancy__c,Calculated_Cost__c,Resource_Status__c,Environment__c, Number_of_VPCs__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> vpcWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_Vpc_Request__c vpc : vpcList){
                List<OceanOrderedProperty> vpcPropertyList = new List<OceanOrderedProperty>();
                vpcPropertyList.add(new OceanOrderedProperty(0,'VPC Id',vpc.Name));
                vpcPropertyList.add(new OceanOrderedProperty(1,'AWS Account',vpc.AWS_Accounts__r.Name));
                vpcPropertyList.add(new OceanOrderedProperty(2,'Resource Status',vpc.Resource_Status__c));
                vpcPropertyList.add(new OceanOrderedProperty(3,'App Component',vpc.Application_Component__c));
                vpcPropertyList.add(new OceanOrderedProperty(4,'Environment',vpc.Environment__c));
                vpcPropertyList.add(new OceanOrderedProperty(5,'AWS Region',vpc.AWS_Region__c));
                vpcPropertyList.add(new OceanOrderedProperty(6,'No of VPC',String.valueOf(vpc.Number_of_VPCs__c)));
                vpcPropertyList.add(new OceanOrderedProperty(7,'Tenacy',vpc.Tenancy__c));
                vpcPropertyList.add(new OceanOrderedProperty(8,'ADO Notes',vpc.ADO_Notes__c));
                vpcPropertyList.add(new OceanOrderedProperty(9,'Calculated Cost',String.valueOf(vpc.Calculated_Cost__c)));          
                
                vpcWrapperList.add(vpcPropertyList);
            }
        exportDataMap.put('VPC',vpcWrapperList);

        //EFS
        List<Ocean_EFS_Request__c> efsList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Infrequent_Access_Requests_GB__c,Number_of_Months_Requested__c,Provisioned_Throughput_MBps__c,Storage_Type__c,Resource_Status__c,Total_Data_Storage_GBMonth__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> efsWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_EFS_Request__c efs : efsList){
                List<OceanOrderedProperty> efsPropertyList = new List<OceanOrderedProperty>();
                efsPropertyList.add(new OceanOrderedProperty(0,'EFS Id',efs.Name));
                efsPropertyList.add(new OceanOrderedProperty(1,'AWS Account',efs.AWS_Accounts__r.Name));
                efsPropertyList.add(new OceanOrderedProperty(2,'Resource Status',efs.Resource_Status__c));
                efsPropertyList.add(new OceanOrderedProperty(3,'App Component',efs.Application_Component__c));
                efsPropertyList.add(new OceanOrderedProperty(4,'Environment',efs.Environment__c));
                efsPropertyList.add(new OceanOrderedProperty(5,'AWS Region',efs.AWS_Region__c));
                efsPropertyList.add(new OceanOrderedProperty(6,'Storage Type',efs.Storage_Type__c));
                efsPropertyList.add(new OceanOrderedProperty(7,'Total Storage',String.valueOf(efs.Total_Data_Storage_GBMonth__c)));
                efsPropertyList.add(new OceanOrderedProperty(8,'Provisioned Throughput',String.valueOf(efs.Provisioned_Throughput_MBps__c)));
                efsPropertyList.add(new OceanOrderedProperty(9,'Infrequent Access',String.valueOf(efs.Infrequent_Access_Requests_GB__c)));
                efsPropertyList.add(new OceanOrderedProperty(10,'No of Months Requested',String.valueOf(efs.Number_of_Months_Requested__c)));
                efsPropertyList.add(new OceanOrderedProperty(11,'ADO Notes',efs.ADO_Notes__c));
                efsPropertyList.add(new OceanOrderedProperty(12,'Calculated Cost',String.valueOf(efs.Calculated_Cost__c)));

                efsWrapperList.add(efsPropertyList);
            }
        exportDataMap.put('EFS',efsWrapperList);

        //RDS
        List<Ocean_RDS_Request__c> rdsList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Availability_Zone__c,AWS_Region__c,DB_Engine_License__c,Deployment__c,Environment__c,Estimated_Monthly_Cost__c,Funding_Type__c,Instance_Quantity__c,InstanceType__c,Number_of_Months_Requested__c,Storage_Type__c,Per_Instance_Uptime_DaysMonth__c,Per_Instance_Uptime_HoursDay__c,Provisioned_IOPS__c,Resource_Status__c,Storage_Size_GB__c 
        FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> rdsWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_RDS_Request__c rds : rdsList){
               List<OceanOrderedProperty> rdsPropertyList = new List<OceanOrderedProperty>();
               rdsPropertyList.add(new OceanOrderedProperty(0,'RDS Id',rds.Name));
               rdsPropertyList.add(new OceanOrderedProperty(1,'AWS Account',rds.AWS_Accounts__r.Name));
               rdsPropertyList.add(new OceanOrderedProperty(2,'Resource Status',rds.Resource_Status__c));
               rdsPropertyList.add(new OceanOrderedProperty(3,'App Component',rds.Application_Component__c));
               rdsPropertyList.add(new OceanOrderedProperty(4,'Environment',rds.Environment__c));
               rdsPropertyList.add(new OceanOrderedProperty(5,'AWS Region',rds.AWS_Region__c));
               rdsPropertyList.add(new OceanOrderedProperty(6,'Deployment',rds.Deployment__c));
               rdsPropertyList.add(new OceanOrderedProperty(7,'AWS Availability Zone',rds.AWS_Availability_Zone__c));
               rdsPropertyList.add(new OceanOrderedProperty(8,'Instance Quantity',String.valueOf(rds.Instance_Quantity__c)));
               rdsPropertyList.add(new OceanOrderedProperty(9,'Instance Type',rds.InstanceType__c));
               rdsPropertyList.add(new OceanOrderedProperty(10,'DB Engine License',rds.DB_Engine_License__c));
               rdsPropertyList.add(new OceanOrderedProperty(11,'Storage Size',String.valueOf(rds.Storage_Size_GB__c)));
               rdsPropertyList.add(new OceanOrderedProperty(12,'Storage Type',rds.Storage_Type__c));
               rdsPropertyList.add(new OceanOrderedProperty(13,'Provisioned IOPS',String.valueOf(rds.Provisioned_IOPS__c)));
               rdsPropertyList.add(new OceanOrderedProperty(14,'Uptime Hours/Day',String.valueOf(rds.Per_Instance_Uptime_HoursDay__c)));
               rdsPropertyList.add(new OceanOrderedProperty(15,'Uptime Days/Month',String.valueOf(rds.Per_Instance_Uptime_DaysMonth__c)));
               rdsPropertyList.add(new OceanOrderedProperty(16,'No of Months Requested',String.valueOf(rds.Number_of_Months_Requested__c)));
               rdsPropertyList.add(new OceanOrderedProperty(17,'Funding Type',rds.Funding_Type__c));
               rdsPropertyList.add(new OceanOrderedProperty(18,'ADO Notes',rds.ADO_Notes__c));
               rdsPropertyList.add(new OceanOrderedProperty(19,'Calculated Cost',String.valueOf(rds.Calculated_Cost__c)));

               rdsWrapperList.add(rdsPropertyList);
            }
        exportDataMap.put('RDS',rdsWrapperList);

        //RDSBackup
        List<Ocean_RDS_Backup_Request__c> rdsbackupList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c, Additional_Backup_Storage_GB_Per_Month__c,Backup_Storage_Type__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> rdsBkupWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_RDS_Backup_Request__c rdsBkup : rdsbackupList){
                List<OceanOrderedProperty> rdsBkupPropertyList = new List<OceanOrderedProperty>();
                rdsBkupPropertyList.add(new OceanOrderedProperty(0,'RDSBkup Id',rdsBkup.Name));
                rdsBkupPropertyList.add(new OceanOrderedProperty(1,'AWS Account',rdsBkup.AWS_Accounts__r.Name));
                rdsBkupPropertyList.add(new OceanOrderedProperty(2,'Resource Status',rdsBkup.Resource_Status__c));
                rdsBkupPropertyList.add(new OceanOrderedProperty(3,'App Component',rdsBkup.Application_Component__c));
                rdsBkupPropertyList.add(new OceanOrderedProperty(4,'Environment',rdsBkup.Environment__c));
                rdsBkupPropertyList.add(new OceanOrderedProperty(5,'AWS Region',rdsBkup.AWS_Region__c));
                rdsBkupPropertyList.add(new OceanOrderedProperty(6,'Backup Storage Type',rdsBkup.Backup_Storage_Type__c));
                rdsBkupPropertyList.add(new OceanOrderedProperty(7,'Additional Storage',String.valueOf(rdsBkup.Additional_Backup_Storage_GB_Per_Month__c)));
                rdsBkupPropertyList.add(new OceanOrderedProperty(8,'No of Months Requested',String.valueOf(rdsBkup.Number_of_Months_Requested__c)));
                rdsBkupPropertyList.add(new OceanOrderedProperty(9,'ADO Notes',rdsBkup.ADO_Notes__c));
                rdsBkupPropertyList.add(new OceanOrderedProperty(10,'Calculated Cost',String.valueOf(rdsBkup.Calculated_Cost__c)));
                
                rdsBkupWrapperList.add(rdsBkupPropertyList);
            }
        exportDataMap.put('RDS Backup Storage',rdsBkupWrapperList);
        
        //ELB
        List<Ocean_ELB_Request__c> elbList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Environment__c,Calculated_Cost__c,Estimated_Monthly_Cost__c,Load_Balancing_Type__c,Data_Processed_per_Load_Balancer__c,Number_Load_Balancers__c,Number_of_Months_Requested__c,Resource_Status__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> elbWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_ELB_Request__c elb : elbList) {
                List<OceanOrderedProperty> elbPropertyList = new List<OceanOrderedProperty>();
                elbPropertyList.add(new OceanOrderedProperty(0,'ELB Id',elb.Name));
                elbPropertyList.add(new OceanOrderedProperty(1,'AWS Account',elb.AWS_Accounts__r.Name));
                elbPropertyList.add(new OceanOrderedProperty(2,'Resource Status',elb.Resource_Status__c));
                elbPropertyList.add(new OceanOrderedProperty(3,'App Component',elb.Application_Component__c));
                elbPropertyList.add(new OceanOrderedProperty(4,'Environment',elb.Environment__c));
                elbPropertyList.add(new OceanOrderedProperty(5,'AWS Region',elb.AWS_Region__c));
                elbPropertyList.add(new OceanOrderedProperty(6,'No of Load Balancers',String.valueOf(elb.Number_Load_Balancers__c)));
                elbPropertyList.add(new OceanOrderedProperty(7,'Data Processed',String.valueOf(elb.Data_Processed_per_Load_Balancer__c)));
                elbPropertyList.add(new OceanOrderedProperty(8,'No of Months Requested',String.valueOf(elb.Number_of_Months_Requested__c)));
                elbPropertyList.add(new OceanOrderedProperty(9,'ADO Notes',elb.ADO_Notes__c));
                elbPropertyList.add(new OceanOrderedProperty(10,'Calculated Cost',String.valueOf(elb.Calculated_Cost__c)));

                elbWrapperList.add(elbPropertyList);
            }
        exportDataMap.put('ELB',elbWrapperList);

        //EMR
        List<Ocean_EMR_Request__c> emrList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Hadoop_Distribution__c,Calculated_Cost__c,Environment__c,Funding_Type__c,Instance_Quantity__c,Instance_Type__c,Number_of_Months_Requested__c,Uptime_DaysMonth__c,Uptime_HoursDay__c,Resource_Status__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> emrWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_EMR_Request__c emr : emrList){
                List<OceanOrderedProperty> emrPropertyList = new List<OceanOrderedProperty>();
                emrPropertyList.add(new OceanOrderedProperty(0,'EMR Id',emr.Name));
                emrPropertyList.add(new OceanOrderedProperty(1,'AWS Accounts',emr.AWS_Accounts__r.Name));
                emrPropertyList.add(new OceanOrderedProperty(2,'Resource Status',emr.Resource_Status__c));
                emrPropertyList.add(new OceanOrderedProperty(3,'App Component',emr.Application_Component__c));
                emrPropertyList.add(new OceanOrderedProperty(4,'Environment',emr.Environment__c));
                emrPropertyList.add(new OceanOrderedProperty(5,'AWS Region',emr.AWS_Region__c));
                emrPropertyList.add(new OceanOrderedProperty(6,'Instance Quantity',String.valueOf(emr.Instance_Quantity__c)));
                emrPropertyList.add(new OceanOrderedProperty(7,'Instance Type',emr.Instance_Type__c));
                emrPropertyList.add(new OceanOrderedProperty(8,'Hadoop Distribution',emr.Hadoop_Distribution__c));
                emrPropertyList.add(new OceanOrderedProperty(9,'No of Months Requested',String.valueOf(emr.Number_of_Months_Requested__c)));
                emrPropertyList.add(new OceanOrderedProperty(10,'Uptime Hours/Day',String.valueOf(emr.Uptime_HoursDay__c)));
                emrPropertyList.add(new OceanOrderedProperty(11,'Uptime Days/Month',String.valueOf(emr.Uptime_DaysMonth__c)));
                emrPropertyList.add(new OceanOrderedProperty(12,'Funding Type',emr.Funding_Type__c));
                emrPropertyList.add(new OceanOrderedProperty(13,'ADO Notes',emr.ADO_Notes__c));
                emrPropertyList.add(new OceanOrderedProperty(14,'Calculated Cost',String.valueOf(emr.Calculated_Cost__c)));

                emrWrapperList.add(emrPropertyList);
            }
        exportDataMap.put('EMR',emrWrapperList);

        //LAMBDA
        List<Ocean_Lambda__c> lambdaList = [SELECT Name, ADO_Notes__c,Application__c,Application_Component__c,AWS_Accounts__r.Name,AWS_Region__c,Environment__c, Calculated_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Estimated_Execution_Time_ms__c, Number_of_Executions_per_Month__c, Allocated_Memory_MB__c
        FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> lambdaWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_Lambda__c lambda : lambdaList){
                List<OceanOrderedProperty> lambdaPropertyList = new List<OceanOrderedProperty>();
                lambdaPropertyList.add(new OceanOrderedProperty(0,'Lambda Id',lambda.Name));
                lambdaPropertyList.add(new OceanOrderedProperty(1,'AWS Account',lambda.AWS_Accounts__r.Name));
                lambdaPropertyList.add(new OceanOrderedProperty(2,'Resource Status',lambda.Resource_Status__c));
                lambdaPropertyList.add(new OceanOrderedProperty(3,'App Component',lambda.Application_Component__c));
                lambdaPropertyList.add(new OceanOrderedProperty(4,'Environment',lambda.Environment__c));
                lambdaPropertyList.add(new OceanOrderedProperty(5,'AWS Region',lambda.AWS_Region__c));
                lambdaPropertyList.add(new OceanOrderedProperty(6,'No of executions',String.valueOf(lambda.Number_of_Executions_per_Month__c)));
                lambdaPropertyList.add(new OceanOrderedProperty(7,'Estimated Execution Time',String.valueOf(lambda.Estimated_Execution_Time_ms__c)));
                lambdaPropertyList.add(new OceanOrderedProperty(8,'Allocated Memory',String.valueOf(lambda.Allocated_Memory_MB__c)));
                lambdaPropertyList.add(new OceanOrderedProperty(9,'No of Months Requested',String.valueOf(lambda.Number_of_Months_Requested__c)));
                lambdaPropertyList.add(new OceanOrderedProperty(10,'ADO Notes',lambda.ADO_Notes__c));
                lambdaPropertyList.add(new OceanOrderedProperty(11,'Calculated Cost',String.valueOf(lambda.Calculated_Cost__c)));

                lambdaWrapperList.add(lambdaPropertyList);
            }
        exportDataMap.put('Lambda',lambdaWrapperList);

        //QuickSight
        List<Ocean_QuickSight_Request__c> quicksightList = [SELECT Name, ADO_Notes__c, Application_Component__c, AWS_Accounts__r.Name, AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,No_of_Sessions_per_UserMonth__c,Number_of_Months_Requested__c,Resource_Status__c, Calculated_Cost__c,Total_Estimated_Cost__c, User_Type__c, No_of_Users__c, Subscription_Model__c
        FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> qsWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_QuickSight_Request__c qs : quicksightList) {
                List<OceanOrderedProperty> qsPropertyList = new List<OceanOrderedProperty>();
                qsPropertyList.add(new OceanOrderedProperty(0,'QS Id',qs.Name));
                qsPropertyList.add(new OceanOrderedProperty(1,'AWS Account',qs.AWS_Accounts__r.Name));
                qsPropertyList.add(new OceanOrderedProperty(2,'Resource Status',qs.Resource_Status__c));
                qsPropertyList.add(new OceanOrderedProperty(3,'App Component',qs.Application_Component__c));
                qsPropertyList.add(new OceanOrderedProperty(4,'Environment',qs.Environment__c));
                qsPropertyList.add(new OceanOrderedProperty(5,'AWS Region',qs.AWS_Region__c));
                qsPropertyList.add(new OceanOrderedProperty(6,'No of Users',String.valueOf(qs.No_of_Users__c)));
                qsPropertyList.add(new OceanOrderedProperty(7,'User Type',qs.User_Type__c));
                qsPropertyList.add(new OceanOrderedProperty(8,'Subscription Model',qs.Subscription_Model__c));
                qsPropertyList.add(new OceanOrderedProperty(9,'No of Sessions',String.valueOf(qs.No_of_Sessions_per_UserMonth__c)));
                qsPropertyList.add(new OceanOrderedProperty(10,'No of Months Requested',String.valueOf(qs.Number_of_Months_Requested__c)));
                qsPropertyList.add(new OceanOrderedProperty(11,'ADO Notes',qs.ADO_Notes__c));
                qsPropertyList.add(new OceanOrderedProperty(12,'Calculated Cost',String.valueOf(qs.Calculated_Cost__c)));

                qsWrapperList.add(qsPropertyList);
            }
        exportDataMap.put('Quicksight',qsWrapperList);

        //DynamoDB
        List<Ocean_DynamoDB_Request__c> dynamodbList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Capacity_Type__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Read_Capacity_Units_per_Month__c,Read_Consistency__c,Reservation_Term__c,Total_Data_Storage_GBMonth__c,Write_Capacity_Units_per_Month__c,Resource_Status__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> dynamoWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_DynamoDB_Request__c dynamo : dynamodbList){
                List<OceanOrderedProperty> dynamoPropertyList = new List<OceanOrderedProperty>();
                dynamoPropertyList.add(new OceanOrderedProperty(0,'DynamoDB Id',dynamo.Name));
                dynamoPropertyList.add(new OceanOrderedProperty(1,'AWS Account',dynamo.AWS_Accounts__r.Name));
                dynamoPropertyList.add(new OceanOrderedProperty(2,'Resource Status',dynamo.Resource_Status__c));
                dynamoPropertyList.add(new OceanOrderedProperty(3,'App Component',dynamo.Application_Component__c));
                dynamoPropertyList.add(new OceanOrderedProperty(4,'Environment',dynamo.Environment__c));
                dynamoPropertyList.add(new OceanOrderedProperty(5,'AWS Region',dynamo.AWS_Region__c));
                dynamoPropertyList.add(new OceanOrderedProperty(6,'Capacity Type',dynamo.Capacity_Type__c));
                dynamoPropertyList.add(new OceanOrderedProperty(7,'Total Storage',String.valueOf(dynamo.Total_Data_Storage_GBMonth__c)));
                dynamoPropertyList.add(new OceanOrderedProperty(8,'Read Capacity',String.valueOf(dynamo.Read_Capacity_Units_per_Month__c)));
                dynamoPropertyList.add(new OceanOrderedProperty(9,'Write Capacity',String.valueOf(dynamo.Write_Capacity_Units_per_Month__c)));
                dynamoPropertyList.add(new OceanOrderedProperty(10,'No of Months Requested',String.valueOf(dynamo.Number_of_Months_Requested__c)));
                dynamoPropertyList.add(new OceanOrderedProperty(11,'ADO Notes',dynamo.ADO_Notes__c));
                dynamoPropertyList.add(new OceanOrderedProperty(12,'Calculated Cost',String.valueOf(dynamo.Calculated_Cost__c)));

                dynamoWrapperList.add(dynamoPropertyList);
            }
        exportDataMap.put('DynamoDB',dynamoWrapperList);                          

        //DataTransfer
        List<Ocean_DataTransfer_Request__c> dataTransferList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Data_Transfer_Amount_GBMonth__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Data_Transfer_Type__c,Resource_Status__c,Total_Estimated_Cost__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> dtWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_DataTransfer_Request__c dt : dataTransferList){
                List<OceanOrderedProperty> dtPropertyList = new List<OceanOrderedProperty>();
                dtPropertyList.add(new OceanOrderedProperty(0,'DT Id',dt.Name));
                dtPropertyList.add(new OceanOrderedProperty(1,'AWS Account',dt.AWS_Accounts__r.Name));
                dtPropertyList.add(new OceanOrderedProperty(2,'Resource Status',dt.Resource_Status__c));
                dtPropertyList.add(new OceanOrderedProperty(3,'App Component',dt.Application_Component__c));
                dtPropertyList.add(new OceanOrderedProperty(4,'Environment',dt.Environment__c));
                dtPropertyList.add(new OceanOrderedProperty(5,'AWS Region',dt.AWS_Region__c));
                dtPropertyList.add(new OceanOrderedProperty(6,'Data Transfer Type',dt.Data_Transfer_Type__c));
                dtPropertyList.add(new OceanOrderedProperty(7,'Data Transfer Amount',String.valueOf(dt.Data_Transfer_Amount_GBMonth__c)));
                dtPropertyList.add(new OceanOrderedProperty(8,'No of Months Requested',String.valueOf(dt.Number_of_Months_Requested__c)));
                dtPropertyList.add(new OceanOrderedProperty(9,'ADO Notes',dt.ADO_Notes__c));
                dtPropertyList.add(new OceanOrderedProperty(10,'Calculated Cost',String.valueOf(dt.Calculated_Cost__c)));

                dtWrapperList.add(dtPropertyList);         
            }
        exportDataMap.put('Data Transfer',dtWrapperList);

        //Workspace
        List<Ocean_Workspaces_Request__c> wkspaceList = [SELECT Name,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Additional_Storage_per_User_GB__c,Billing_Options__c,License__c,Number_of_Workspaces__c,Root_Volume_User_Volume__c,Workspace_Bundle__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> wsWrapperList = new List<List<OceanOrderedProperty>>();
            For(Ocean_Workspaces_Request__c ws : wkspaceList){
                List<OceanOrderedProperty> wsPropertyList = new List<OceanOrderedProperty>();
                wsPropertyList.add(new OceanOrderedProperty(0,'WS Id',ws.Name));
                wsPropertyList.add(new OceanOrderedProperty(1,'AWS Account',ws.AWS_Accounts__r.Name));
                wsPropertyList.add(new OceanOrderedProperty(2,'Resource Status',ws.Resource_Status__c));
                wsPropertyList.add(new OceanOrderedProperty(3,'App Component',ws.Application_Component__c));
                wsPropertyList.add(new OceanOrderedProperty(4,'Environment',ws.Environment__c));
                wsPropertyList.add(new OceanOrderedProperty(5,'AWS Region',ws.AWS_Region__c));
                wsPropertyList.add(new OceanOrderedProperty(6,'No of WS',String.valueOf(ws.Number_of_Workspaces__c)));
                wsPropertyList.add(new OceanOrderedProperty(7,'WS Bundle',ws.Workspace_Bundle__c));
                wsPropertyList.add(new OceanOrderedProperty(8,'License',ws.License__c));
                wsPropertyList.add(new OceanOrderedProperty(9,'Root/User Volume',ws.Root_Volume_User_Volume__c));
                wsPropertyList.add(new OceanOrderedProperty(10,'Billing Option',ws.Billing_Options__c));
                wsPropertyList.add(new OceanOrderedProperty(11,'Additional Storage',String.valueOf(ws.Additional_Storage_per_User_GB__c)));
                wsPropertyList.add(new OceanOrderedProperty(12,'No of Months Requested',String.valueOf(ws.Number_of_Months_Requested__c)));
                wsPropertyList.add(new OceanOrderedProperty(13,'ADO Notes',ws.ADO_Notes__c));
                wsPropertyList.add(new OceanOrderedProperty(14,'Calculated Cost',String.valueOf(ws.Calculated_Cost__c)));

                wsWrapperList.add(wsPropertyList);   
            }
        exportDataMap.put('Workspaces',wsWrapperList);

        //Redshift
        List<Ocean_Redshift_Request__c> redshiftList = [SELECT Name, ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c,Estimated_Monthly_Cost__c,Number_of_Months_Requested__c,Resource_Status__c,Total_Estimated_Cost__c,Funding_Type__c,Node_Quantity__c,Redshift_Type__c,Usage_Hours_Per_Day__c, Usage_Hours_Per_Month__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> rsWrapperList = new List<List<OceanOrderedProperty>>();
            for(Ocean_Redshift_Request__c rs : redshiftList){
                List<OceanOrderedProperty> rsPropertyList = new List<OceanOrderedProperty>();
                rsPropertyList.add(new OceanOrderedProperty(0,'RS Id',rs.Name));
                rsPropertyList.add(new OceanOrderedProperty(1,'AWS Account',rs.AWS_Accounts__r.Name));
                rsPropertyList.add(new OceanOrderedProperty(2,'Resource Status',rs.Resource_Status__c));
                rsPropertyList.add(new OceanOrderedProperty(3,'App Component',rs.Application_Component__c));
                rsPropertyList.add(new OceanOrderedProperty(4,'Environment',rs.Environment__c));
                rsPropertyList.add(new OceanOrderedProperty(5,'AWS Region',rs.AWS_Region__c));
                rsPropertyList.add(new OceanOrderedProperty(6,'RS Type',rs.Redshift_Type__c));
                rsPropertyList.add(new OceanOrderedProperty(7,'RS Quantity',String.valueOf(rs.Node_Quantity__c)));
                rsPropertyList.add(new OceanOrderedProperty(8,'Usage Hours/Day',String.valueOf(rs.Usage_Hours_Per_Day__c)));
                rsPropertyList.add(new OceanOrderedProperty(9,'Usage Days/Month',String.valueOf(rs.Usage_Hours_Per_Month__c)));
                rsPropertyList.add(new OceanOrderedProperty(10,'No of Months Requested',String.valueOf(rs.Number_of_Months_Requested__c)));
                rsPropertyList.add(new OceanOrderedProperty(11,'ADO Notes',rs.ADO_Notes__c));
                rsPropertyList.add(new OceanOrderedProperty(12,'Calculated Cost',String.valueOf(rs.Calculated_Cost__c)));

                rsWrapperList.add(rsPropertyList);
            }
        exportDataMap.put('Redshift',rsWrapperList);

        //OtherService
        List<Ocean_Other_Request__c> otherList = [SELECT Name, Resource_Status__c,ADO_Notes__c,Application_Component__c,AWS_Accounts__r.Name,Calculated_Cost__c,AWS_Region__c,Environment__c, Number_of_Months_Requested__c,Total_Estimated_Cost__c,AWS_Service__c,Quantity__c,Unit__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =:oceanRequestId ORDER BY  CreatedDate];
            List<List<OceanOrderedProperty>> otherWrapperList = new List<List<OceanOrderedProperty>>();
            for(Ocean_Other_Request__c other : otherList) {
                List<OceanOrderedProperty> otherPropertyList = new List<OceanOrderedProperty>();
                otherPropertyList.add(new OceanOrderedProperty(0,'Other Id',other.Name));
                otherPropertyList.add(new OceanOrderedProperty(1,'AWS Account',other.AWS_Accounts__r.Name));
                otherPropertyList.add(new OceanOrderedProperty(2,'Resource Status',other.Resource_Status__c));
                otherPropertyList.add(new OceanOrderedProperty(3,'App Component',other.Application_Component__c));
                otherPropertyList.add(new OceanOrderedProperty(4,'Environment',other.Environment__c));
                otherPropertyList.add(new OceanOrderedProperty(5,'AWS Region',other.AWS_Region__c));
                otherPropertyList.add(new OceanOrderedProperty(6,'AWS Service',other.AWS_Service__c));
                otherPropertyList.add(new OceanOrderedProperty(7,'Quantity',String.valueOf(other.Quantity__c)));
                otherPropertyList.add(new OceanOrderedProperty(8,'Unit',other.Unit__c));
                otherPropertyList.add(new OceanOrderedProperty(9,'No of Months Requested',String.valueOf(other.Number_of_Months_Requested__c)));
                otherPropertyList.add(new OceanOrderedProperty(10,'ADO Notes',other.ADO_Notes__c));
                otherPropertyList.add(new OceanOrderedProperty(11,'Calculated Cost',String.valueOf(other.Calculated_Cost__c)));

                otherWrapperList.add(otherPropertyList);    
            }
        exportDataMap.put('Other Service',otherWrapperList);

        system.debug('exportMap:::'+exportDataMap);
        return exportDataMap;
    }
    
}
