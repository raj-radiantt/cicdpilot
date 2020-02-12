@isTest
public with sharing class Test_OceanUpdateResourceStatus {
    public static testMethod void oceanUpdateResourceStatus(){
        test.startTest();
        
        CollaborationGroup crmsGroup = new CollaborationGroup();
        crmsGroup.name = 'Cloud Resource Management Support Team';
        crmsGroup.CollaborationType = 'Public';
        insert crmsGroup;

        CollaborationGroup crmtGroup = new CollaborationGroup();
        crmtGroup.name = 'Cloud Resource Management Team';
        crmtGroup.CollaborationType = 'Public';
        insert crmtGroup;

        OCEAN_Request__c oceanRequest = TestDataFactory.getOceanRequest();
        OCEAN_Request__c oceanRequest1 = TestDataFactory.getNextOceanRequest();

        OCEAN_Ec2Instance__c ec2Instance = TestDataFactory.getEC2Instance(oceanRequest);               
        Ocean_Ebs_Storage__c ebsStorage = TestDataFactory.getEBSStorage(oceanRequest);               
        Ocean_S3_Request__c s3Request = TestDataFactory.getS3Request(oceanRequest);       
        Ocean_Vpc_Request__c vpcRequest = TestDataFactory.getVPCRequest(oceanRequest);       
        Ocean_EFS_Request__c efsRequest = TestDataFactory.getEFSRequest(oceanRequest);
        Ocean_RDS_Request__c rdsRequest = TestDataFactory.getRDSRequest(oceanRequest);
        Ocean_RDS_Backup_Request__c rdsbkupRequest = TestDataFactory.getRDSBkupRequest(oceanRequest);
        Ocean_ELB_Request__c elbRequest = TestDataFactory.getELBRequest(oceanRequest);
        Ocean_EMR_Request__c emrRequest = TestDataFactory.getEMRRequest(oceanRequest);
        Ocean_Lambda__c lambdaRequest = TestDataFactory.getLambdaRequest(oceanRequest);
        Ocean_QuickSight_Request__c qsRequest = TestDataFactory.getQSRequest(oceanRequest);
        Ocean_DynamoDB_Request__c dynamoDBRequest = TestDataFactory.getDynamoDBRequest(oceanRequest);
        Ocean_DataTransfer_Request__c dtRequest = TestDataFactory.getDTRequest(oceanRequest);
        Ocean_Workspaces_Request__c wkspaceRequest = TestDataFactory.getWkspaceRequest(oceanRequest);
        Ocean_Redshift_Request__c rsRequest = TestDataFactory.getRSRequest(oceanRequest);
        Ocean_Other_Request__c otherRequest = TestDataFactory.getOtherRequest(oceanRequest);

        List<OCEAN_Request__c> oceanRequestList = new List<Ocean_Request__c>();
        oceanRequestList.add(oceanRequest);
        oceanRequestList.add(oceanRequest1);

        OceanUpdateResourceStatus controller = new OceanUpdateResourceStatus();
        controller.updateResourceStatus(oceanRequestList);

        test.stopTest();
    }
}