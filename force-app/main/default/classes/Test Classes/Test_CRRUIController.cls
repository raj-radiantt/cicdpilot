@isTest
public with sharing class Test_CRRUIController {
    public static testMethod void testCRRUI() {
        test.startTest();
        OCEAN_Request__c oceanRequest = TestDataFactory.getOceanRequestExport();

        OceanCRRUIController.getCRRUIMetadata(oceanRequest.id);
        test.stopTest();
    }

    public static testMethod void testCloneRequest(){
        test.startTest();
        OCEAN_Request__c oceanRequest = TestDataFactory.getOceanRequestExport();
        OCEAN_Ec2Instance__c ec2Instance = TestDataFactory.getEC2Instance(oceanRequest);  

        OceanCloneCRRController.cloneRequest(oceanRequest.id);
        test.stopTest();
    }

    public static testMethod void testModifyClonedRequest(){
        test.startTest();
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        oceanRequest.Request_Status__c = 'Draft';
        oceanRequest.CRMT_Request_Status__c = 'Draft';
        oceanRequest.Review_Status__c = 'COR/GTL Approval';
        oceanRequest.Approval_Comments__c = 'Comments';
        oceanRequest.Review_Outcome__c = 'Approved';
        oceanRequest.Cloned__c = true;
        insert oceanRequest;

        OCEAN_Ec2Instance__c ec2Instance = TestDataFactory.getEC2Instance(oceanRequest);
        ec2Instance.Environment__c = 'Production';
        update ec2Instance;

        Ocean_Ebs_Storage__c ebsStorage = TestDataFactory.getEBSStorage(oceanRequest); 
        ebsStorage.Environment__c = 'Production';
        update ebsStorage;

        Ocean_S3_Request__c s3Request = TestDataFactory.getS3Request(oceanRequest);  
        s3Request.Environment__c = 'Production';
        update s3Request;

        Ocean_Vpc_Request__c vpcRequest = TestDataFactory.getVPCRequest(oceanRequest); 
        vpcRequest.Environment__c = 'Production';
        update vpcRequest;

        Ocean_EFS_Request__c efsRequest = TestDataFactory.getEFSRequest(oceanRequest);
        efsRequest.Environment__c = 'Production';
        update efsRequest;

        Ocean_RDS_Request__c rdsRequest = TestDataFactory.getRDSRequest(oceanRequest);
        rdsRequest.Environment__c = 'Production';
        update rdsRequest;

        Ocean_RDS_Backup_Request__c rdsbkupRequest = TestDataFactory.getRDSBkupRequest(oceanRequest);
        rdsbkupRequest.Environment__c = 'Production';
        update rdsbkupRequest;

        Ocean_ELB_Request__c elbRequest = TestDataFactory.getELBRequest(oceanRequest);
        elbRequest.Environment__c = 'Production';
        update elbRequest;

        Ocean_EMR_Request__c emrRequest = TestDataFactory.getEMRRequest(oceanRequest);
        emrRequest.Environment__c = 'Production';
        update emrRequest;

        Ocean_Lambda__c lambdaRequest = TestDataFactory.getLambdaRequest(oceanRequest);
        lambdaRequest.Environment__c = 'Production';
        update lambdaRequest;

        Ocean_QuickSight_Request__c qsRequest = TestDataFactory.getQSRequest(oceanRequest);
        qsRequest.Environment__c = 'Production';
        update qsRequest;

        Ocean_DynamoDB_Request__c dynamoDBRequest = TestDataFactory.getDynamoDBRequest(oceanRequest);
        dynamoDBRequest.Environment__c = 'Production';
        update dynamoDBRequest;

        Ocean_DataTransfer_Request__c dtRequest = TestDataFactory.getDTRequest(oceanRequest);
        dtRequest.Environment__c = 'Production';
        update dtRequest;

        Ocean_Workspaces_Request__c wkspaceRequest = TestDataFactory.getWkspaceRequest(oceanRequest);
        wkspaceRequest.Environment__c = 'Production';
        update wkspaceRequest;

        Ocean_Redshift_Request__c rsRequest = TestDataFactory.getRSRequest(oceanRequest);
        rsRequest.Environment__c = 'Production';
        update rsRequest;

        // Ocean_Other_Request__c otherRequest = TestDataFactory.getOtherRequest(oceanRequest);
        // otherRequest.Environment__c = 'Production';
        // update otherRequest;

        test.stopTest();
    }
}
