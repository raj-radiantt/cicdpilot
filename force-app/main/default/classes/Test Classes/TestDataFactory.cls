@isTest
public with sharing class TestDataFactory {

    public static Ocean_Request__c getOceanRequest() {
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        oceanRequest.Request_Status__c = 'CRMT Review';
        oceanRequest.CRMT_Request_Status__c = 'CRMT Intake Review';
        oceanRequest.Review_Status__c = 'Intake Review';
        oceanRequest.Approval_Comments__c = 'Comments';
        oceanRequest.Review_Outcome__c = 'Approved';
        oceanRequest.ApplicationName__c =getApplication().id;
        insert oceanRequest;
        return oceanRequest;
    }

    public static Ocean_Request__c getOceanRequestCORGTL() {
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        oceanRequest.Request_Status__c = 'COR/GTL Approval';
        oceanRequest.CRMT_Request_Status__c = 'COR/GTL Approval';
        oceanRequest.Review_Status__c = 'COR/GTL Approval';
        oceanRequest.Approval_Comments__c = 'Comments';
        oceanRequest.Review_Outcome__c = '';
        oceanRequest.ApplicationName__c =getApplication().id;
        insert oceanRequest;
        return oceanRequest;
    }

    public static Ocean_Request__c getOceanRequestExport() {
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        oceanRequest.Request_Status__c = 'Draft';
        oceanRequest.CRMT_Request_Status__c = 'Draft';
        oceanRequest.Review_Status__c = 'COR/GTL Approval';
        oceanRequest.Approval_Comments__c = 'Comments';
        oceanRequest.Review_Outcome__c = 'Approved';
        oceanRequest.ApplicationName__c =getApplication().id;
        insert oceanRequest;
        return oceanRequest;
    }

    public static Ocean_Request__c getNextOceanRequest() {
        OCEAN_Request__c oceanRequest1 = new OCEAN_Request__c();
        oceanRequest1.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest1.AWSInstances__c = 'EC2';
        oceanRequest1.ProjectName__c = 'Ocean';
        oceanRequest1.Request_Status__c = 'CRMT Review';
        oceanRequest1.CRMT_Request_Status__c = 'Attestation Requested';
        oceanRequest1.Review_Status__c = 'ADO Attestation';
        oceanRequest1.Approval_Comments__c = 'Comments';
        oceanRequest1.Review_Outcome__c = 'Approved';
        oceanRequest1.ApplicationName__c = getApplication().id;
        insert oceanRequest1;
        return oceanRequest1;
    }

    public static Applications__c getApplication(){
        Applications__c app = new Applications__c();
        insert app; 
        return app;
    }

    public static AWS_Accounts__c getAWSAccount(){
        AWS_Accounts__c awsAcct = new AWS_Accounts__c();
        awsAcct.Name = 'aws-hhs-cms-cciio-regtap';
        insert awsAcct;
        return awsAcct;
    }

    public static OCEAN_Ec2Instance__c getEC2Instance(OCEAN_Request__c oceanRequest){
        OCEAN_Ec2Instance__c ec2Instance = new OCEAN_Ec2Instance__c();
        ec2Instance.AWS_Accounts__c = getAWSAccount().Id;
        ec2Instance.EC2_Instance_Type__c = 't1.micro';
        ec2Instance.Environment__c = 'Test';
        ec2Instance.Instance_Quantity__c = 8;
        ec2Instance.Ocean_Request_Id__c = oceanRequest.Id;
        ec2Instance.PerInstanceUptimePerDay__c = 5;
        ec2Instance.PerInstanceUptimePerMonth__c =15;
        ec2Instance.Per_Instance_Running_Months_in_Remaining__c = 2;
        ec2Instance.Platform__c = 'Linux';
        insert ec2Instance;
        return ec2Instance;
    }

    public static Ocean_Ebs_Storage__c getEBSStorage(OCEAN_Request__c oceanRequest){
        Ocean_Ebs_Storage__c ebsStorage = new Ocean_Ebs_Storage__c();
        ebsStorage.AWS_Accounts__c = getAWSAccount().Id;
        ebsStorage.Resource_Status__c = 'New';
        ebsStorage.AWS_Region__c = 'US East (N. Virginia)';
        ebsStorage.Number_of_Volumes__c = 2;
        ebsStorage.Volume_Type__c = 'General Purpose, SSD-backed';
        ebsStorage.Storage_Size_GB__c = 25;
		ebsStorage.Snapshot_Storage_GB_Per_Month__c = 30;
		ebsStorage.Number_of_Months_Requested__c = 1; 
        ebsStorage.Environment__c = 'Test';
        ebsStorage.Ocean_Request_Id__c = oceanRequest.Id;
        insert ebsStorage;
        return ebsStorage;
    }

    public static Ocean_S3_Request__c getS3Request(OCEAN_Request__c oceanRequest){
        Ocean_S3_Request__c s3Request = new Ocean_S3_Request__c();
        s3Request.AWS_Accounts__c = getAWSAccount().Id;
        s3Request.Ocean_Request_Id__c = oceanRequest.Id;
        s3Request.Environment__c = 'Production';
        s3Request.AWS_Region__c = 'US East (N. Virginia)';
        s3Request.Storage_Type__c = 'Amazon Glacier';
        s3Request.Total_Storage_GBMonth__c = 250;
        s3Request.PUTCOPYPOSTLIST_Requests__c = 5;
        s3Request.GETSELECT_and_Other_Requests__c = 2;
        s3Request.Number_of_Months_Requested__c = 4;
        insert s3Request;
        return s3Request;
    }

    public static Ocean_Vpc_Request__c getVPCRequest(OCEAN_Request__c oceanRequest){
        Ocean_Vpc_Request__c vpcRequest = new Ocean_Vpc_Request__c();
        vpcRequest.AWS_Accounts__c = getAWSAccount().Id;
        vpcRequest.Ocean_Request_Id__c = oceanRequest.Id;
        vpcRequest.Resource_Status__c = 'New';
        vpcRequest.AWS_Region__c = 'US East (N. Virginia)';
        vpcRequest.Tenancy__c = 'Shared';
        vpcRequest.Environment__c = 'Test';
        vpcRequest.Number_of_VPCs__c = 2;
        insert vpcRequest;
        return vpcRequest;
    }

    public static Ocean_EFS_Request__c getEFSRequest(OCEAN_Request__c oceanRequest){
        Ocean_EFS_Request__c efsRequest = new Ocean_EFS_Request__c();
        efsRequest.AWS_Accounts__c = getAWSAccount().Id;
        efsRequest.Ocean_Request_Id__c = oceanRequest.Id;
        efsRequest.Environment__c = 'Production';
        efsRequest.Resource_Status__c = 'New';
        efsRequest.AWS_Region__c = 'US East (N. Virginia)';
        efsRequest.Number_of_Months_Requested__c = 2;
        efsRequest.Storage_Type__c = 'General Purpose';
        efsRequest.Total_Data_Storage_GBMonth__c = 100;
        insert efsRequest;
        return efsRequest;
    }

    public static Ocean_RDS_Request__c getRDSRequest(OCEAN_Request__c oceanRequest){
        Ocean_RDS_Request__c rdsRequest = new Ocean_RDS_Request__c();
        rdsRequest.AWS_Accounts__c = getAWSAccount().Id;
        rdsRequest.Ocean_Request_Id__c = oceanRequest.Id;
        rdsRequest.Environment__c = 'Production';
        rdsRequest.AWS_Region__c = 'US East (N. Virginia)';
        rdsRequest.Deployment__c = 'Single-AZ';
        rdsRequest.InstanceType__c = 'db.cv11.18xlarge';
        rdsRequest.Instance_Quantity__c = 2;
        rdsRequest.Storage_Type__c = 'General Purpose (SSD)';
        rdsRequest.Storage_Size_GB__c = 25;
        rdsRequest.DB_Engine_License__c = 'MySQL, No license required';
        rdsRequest.Per_Instance_Uptime_HoursDay__c = 5;
        rdsRequest.Per_Instance_Uptime_DaysMonth__c = 15;
        rdsRequest.Number_of_Months_Requested__c = 5;
        rdsRequest.Funding_Type__c = 'OnDemand';
        insert rdsRequest;
        return rdsRequest;
    }
    
    public static Ocean_RDS_Backup_Request__c getRDSBkupRequest(OCEAN_Request__c oceanRequest){
        Ocean_RDS_Backup_Request__c rdsbkupRequest = new Ocean_RDS_Backup_Request__c();
        rdsbkupRequest.AWS_Accounts__c = getAWSAccount().Id;
        rdsbkupRequest.Ocean_Request_Id__c = oceanRequest.Id;
        rdsbkupRequest.Environment__c = 'Production';
        rdsbkupRequest.AWS_Region__c = 'US East (N. Virginia)';
        rdsbkupRequest.Backup_Storage_Type__c = 'Standard Backup';
        rdsbkupRequest.Number_of_Months_Requested__c = 2;
        rdsbkupRequest.Resource_Status__c = 'New';
        rdsbkupRequest.Additional_Backup_Storage_GB_Per_Month__c = 5;
        insert rdsbkupRequest;
        return rdsbkupRequest;
    }

    public static Ocean_ELB_Request__c getELBRequest(OCEAN_Request__c oceanRequest){
        Ocean_ELB_Request__c elbRequest = new Ocean_ELB_Request__c();
        elbRequest.AWS_Accounts__c = getAWSAccount().Id;
        elbRequest.Ocean_Request_Id__c = oceanRequest.Id;
        elbRequest.Environment__c = 'Production';
        elbRequest.AWS_Region__c = 'US East (N. Virginia)';
        elbRequest.Resource_Status__c = 'New';
        elbRequest.Load_Balancing_Type__c = 'Load Balancer';
        elbRequest.Number_Load_Balancers__c = 2;
        elbRequest.Data_Processed_per_Load_Balancer__c = 4;
        elbRequest.Number_of_Months_Requested__c = 1;
        insert elbRequest;
        return elbRequest;
    }

    public static Ocean_EMR_Request__c getEMRRequest(OCEAN_Request__c oceanRequest){
        Ocean_EMR_Request__c emrRequest = new Ocean_EMR_Request__c();
        emrRequest.AWS_Accounts__c = getAWSAccount().Id;
        emrRequest.Ocean_Request_Id__c = oceanRequest.Id;
        emrRequest.Environment__c = 'Test';
        emrRequest.Resource_Status__c = 'New';
        emrRequest.Instance_Quantity__c = 2;
        emrRequest.Instance_Type__c = 'c1.medium';
        emrRequest.Hadoop_Distribution__c = 'EMR';
        emrRequest.Number_of_Months_Requested__c = 2;
        emrRequest.Uptime_HoursDay__c = 5;
        emrRequest.Uptime_DaysMonth__c = 20;
        emrRequest.Funding_Type__c = 'OnDemand';
        insert emrRequest;
        return emrRequest;
    }

    public static Ocean_Lambda__c getLambdaRequest(OCEAN_Request__c oceanRequest){
        Ocean_Lambda__c lambdaRequest = new Ocean_Lambda__c();
        lambdaRequest.AWS_Accounts__c = getAWSAccount().Id;
        lambdaRequest.Ocean_Request_Id__c = oceanRequest.Id;
        lambdaRequest.Environment__c = 'Test';
        lambdaRequest.Resource_Status__c = 'New';
        lambdaRequest.AWS_Region__c = 'US East (N. Virginia)';
        lambdaRequest.Number_of_Executions_per_Month__c = 10;
        lambdaRequest.Number_of_Months_Requested__c = 5;
        lambdaRequest.Estimated_Execution_Time_ms__c = 25000;
        lambdaRequest.Allocated_Memory_MB__c = 256;
        insert lambdaRequest;
        return lambdaRequest;
    }

    public static Ocean_QuickSight_Request__c getQSRequest(OCEAN_Request__c oceanRequest){
        Ocean_QuickSight_Request__c qsRequest = new Ocean_QuickSight_Request__c();
        qsRequest.AWS_Accounts__c = getAWSAccount().Id;
        qsRequest.Ocean_Request_Id__c = oceanRequest.Id;
        qsRequest.Environment__c = 'Test';
        qsRequest.Resource_Status__c = 'New';
        qsRequest.Environment__c = 'Test';
        qsRequest.AWS_Region__c = 'US East (N. Virginia)';
        qsRequest.No_of_Users__c = 5;
        qsRequest.User_Type__c = 'Author';
        qsRequest.Subscription_Model__c = 'Monthly';
        qsRequest.Number_of_Months_Requested__c = 6;
        insert qsRequest;
        return qsRequest;
    }

    public static Ocean_DynamoDB_Request__c getDynamoDBRequest(OCEAN_Request__c oceanRequest){
        Ocean_DynamoDB_Request__c dynamoDBRequest = new Ocean_DynamoDB_Request__c();
        dynamoDBRequest.AWS_Accounts__c = getAWSAccount().Id;
        dynamoDBRequest.Ocean_Request_Id__c = oceanRequest.Id;
        dynamoDBRequest.Environment__c = 'Test';
        dynamoDBRequest.Resource_Status__c = 'New';
        dynamoDBRequest.Capacity_Type__c = 'OnDemand';
        dynamoDBRequest.AWS_Region__c = 'US East (N. Virginia)';
        dynamoDBRequest.Total_Data_Storage_GBMonth__c = 25;
        dynamoDBRequest.Read_Capacity_Units_per_Month__c = 3;
        dynamoDBRequest.Write_Capacity_Units_per_Month__c = 5;
        dynamoDBRequest.Number_of_Months_Requested__c = 2;
        insert dynamoDBRequest;
        return dynamoDBRequest;
    }

    public static Ocean_DataTransfer_Request__c getDTRequest(OCEAN_Request__c oceanRequest){
        Ocean_DataTransfer_Request__c dtRequest = new Ocean_DataTransfer_Request__c();
        dtRequest.AWS_Accounts__c = getAWSAccount().Id;
        dtRequest.Ocean_Request_Id__c = oceanRequest.Id;
        dtRequest.Environment__c = 'Test';
        dtRequest.Resource_Status__c = 'New';
        dtRequest.Data_Transfer_Type__c = 'IntraRegion';
        dtRequest.Data_Transfer_Amount_GBMonth__c = 25;
        dtRequest.Number_of_Months_Requested__c = 6;
        insert dtRequest;
        return dtRequest;
    }

    public static Ocean_Workspaces_Request__c getWkspaceRequest(OCEAN_Request__c oceanRequest){
        Ocean_Workspaces_Request__c wkspaceRequest = new Ocean_Workspaces_Request__c();
        wkspaceRequest.AWS_Accounts__c = getAWSAccount().Id;
        wkspaceRequest.Ocean_Request_Id__c = oceanRequest.Id;
        wkspaceRequest.Environment__c = 'Test';
        wkspaceRequest.Resource_Status__c = 'New';
        wkspaceRequest.AWS_Region__c = 'US East (N. Virginia)';
        wkspaceRequest.Number_of_Months_Requested__c = 6;
        wkspaceRequest.Number_of_Workspaces__c = 2;
        wkspaceRequest.Workspace_Bundle__c = 'Graphics';
        wkspaceRequest.License__c = 'Amazon Linux, Included';
        wkspaceRequest.Root_Volume_User_Volume__c = 'Root:80 GB,User:50 GB';
        wkspaceRequest.Billing_Options__c = 'Billed by the month';
        insert wkspaceRequest;
        return wkspaceRequest;
    }

    public static Ocean_Redshift_Request__c getRSRequest(OCEAN_Request__c oceanRequest){
        Ocean_Redshift_Request__c rsRequest = new Ocean_Redshift_Request__c();
        rsRequest.AWS_Accounts__c = getAWSAccount().Id;
        rsRequest.Ocean_Request_Id__c = oceanRequest.Id;
        rsRequest.Environment__c = 'Test';
        rsRequest.Resource_Status__c = 'New';
        rsRequest.AWS_Region__c = 'US East (N. Virginia)';
        rsRequest.Number_of_Months_Requested__c = 6;
        rsRequest.Node_Quantity__c = 4;
        rsRequest.Redshift_Type__c = 'dc1.8xlarge';
        rsRequest.Number_of_Months_Requested__c = 6;
        rsRequest.Usage_Hours_Per_Day__c = 8;
        rsRequest.Usage_Hours_Per_Month__c = 21;
        rsRequest.Funding_Type__c = 'OnDemand';
        insert rsRequest;
        return rsRequest;
    }

    public static Ocean_Other_Request__c getOtherRequest(OCEAN_Request__c oceanRequest){
        Ocean_Other_Request__c otherRequest = new Ocean_Other_Request__c();
        otherRequest.AWS_Accounts__c = getAWSAccount().Id;
        otherRequest.Ocean_Request_Id__c = oceanRequest.Id;
        otherRequest.Environment__c = 'Test';
        otherRequest.Resource_Status__c = 'New';
        otherRequest.AWS_Region__c = 'US East (N. Virginia)';
        otherRequest.Unit__c = 'Test Unit';
        otherRequest.AWS_Service__c = 'EMR';
        otherRequest.Quantity__c = 5;
        otherRequest.Number_of_Months_Requested__c = 2;
        insert otherRequest;
        return otherRequest;
    }    
}