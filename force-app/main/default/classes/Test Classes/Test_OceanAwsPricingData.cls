@isTest
public class Test_OceanAwsPricingData {
    
    public static testMethod void awsPricingDataTest(){
        test.startTest();
        // For the Class OceanDataOptions
        OceanDataOptions.getAwsEc2Types();
        
        // For the Class OceanEc2PricingWrapper
        OceanEc2PricingWrapper ec2Wrapper = new OceanEc2PricingWrapper();
        ec2Wrapper.instanceType = 'Test Instance Type';
        ec2Wrapper.leaseContractLength = '12 months';
        ec2Wrapper.offeringClass = 'Test Offering Class';
        ec2Wrapper.platform = 'Salesforce';
        ec2Wrapper.preInstalledSW = 'Test Software';
        ec2Wrapper.purchaseOption = 'Cash';
        ec2Wrapper.region = 'Test Region';
        ec2Wrapper.tenancy = 'Test Tenacy';
        ec2Wrapper.termType = 'Test Term';
        
        // For the class OceanRDSPricingWrapper
        OceanRDSPricingWrapper rdsWrapper = new OceanRDSPricingWrapper();
        rdsWrapper.databaseEdition = 'Test DBEdition';
        rdsWrapper.databaseEngine = 'Test DBEngine';
        rdsWrapper.deploymentOption = 'Test Option';
        rdsWrapper.instanceType = 'Test Instance Type';
        rdsWrapper.leaseContractLength = '3 months';
        rdsWrapper.licenseModel = 'License';
        rdsWrapper.offeringClass = ' Test Class';
        rdsWrapper.purchaseOption = 'Credit';
        rdsWrapper.region = 'Test Region';
        rdsWrapper.termType = 'Term';
        
        // For the class OceanWorkspacesPricingWrapper
        OceanWorkspacesPricingWrapper wrkspaceWrapper = new OceanWorkspacesPricingWrapper();
        wrkspaceWrapper.billingOption = 'Test Billing Option';
        wrkspaceWrapper.bundle = 'Test bundle';
        wrkspaceWrapper.license = 'Test License';
        wrkspaceWrapper.operatingSystem = 'Test OS';
        wrkspaceWrapper.region = 'Test Region';
        //wrkspaceWrapper.runningMode = 'Test running mode';
        wrkspaceWrapper.storage = 'Test Storage';
        
        // For the class OceanDynamoDBPricingWrapper
        OceanDynamoDBPricingWrapper dynamoWrapper = new OceanDynamoDBPricingWrapper();
        dynamoWrapper.dataStorage = '12';
        dynamoWrapper.leaseContractLength = '6 months';
        dynamoWrapper.numberOfMonths = '6';
        dynamoWrapper.readUnits = 'Test Units';
        dynamoWrapper.region = 'Test region';
        dynamoWrapper.termType = 'Reserved';
        dynamoWrapper.writeUnits = 'Test Write Units';
        OceanDynamoDBPricingWrapper dynamoWrapper1 = new OceanDynamoDBPricingWrapper();
        dynamoWrapper1.dataStorage = '12';
        dynamoWrapper1.leaseContractLength = '6 months';
        dynamoWrapper1.numberOfMonths = '6';
        dynamoWrapper1.readUnits = 'Test Units';
        dynamoWrapper1.region = 'Test region';
        dynamoWrapper1.termType = 'OnDemand';
        dynamoWrapper1.writeUnits = 'Test Write Units';
        OceanDynamoDBPricingWrapper dynamoWrapper2 = new OceanDynamoDBPricingWrapper();
        dynamoWrapper2.dataStorage = '12';
        dynamoWrapper2.leaseContractLength = '6 months';
        dynamoWrapper2.numberOfMonths = '6';
        dynamoWrapper2.readUnits = 'Test Units';
        dynamoWrapper2.region = 'Test region';
        dynamoWrapper2.termType = 'Provisioned Capacity';
        dynamoWrapper2.writeUnits = 'Test Write Units';
        
        // For the class OceanRedShiftPricingWrapper
        OceanRedShiftPricingWrapper rsWrapper = new OceanRedShiftPricingWrapper();
        rsWrapper.instanceType = 'Test InstanceType';
        rsWrapper.leaseContractLength = '1 Year';
        rsWrapper.offeringClass = 'Test Offering Class';
        rsWrapper.productFamily = 'Test Product';
        rsWrapper.purchaseOption = 'Credit';
        rsWrapper.region = 'Test Region';
        rsWrapper.termType = 'Test Term Type';

        // For the class OceanS3PricingWrapper
        OceanS3PricingWrapper s3Wrapper = new OceanS3PricingWrapper();
        s3Wrapper.volumeType = 'Standard';
        s3Wrapper.region = 'US West (Oregon)';
        s3Wrapper.storageSize = 250;
        s3Wrapper.requestedMonths = 1;
        s3Wrapper.noPutCopyListRequests = 10;
        s3Wrapper.noGetRequests = 12;
        OceanS3PricingWrapper s3Wrapper1 = new OceanS3PricingWrapper();
        s3Wrapper1.volumeType = 'Standard - Infrequent Access';
        s3Wrapper1.region = 'US West (Oregon)';
        s3Wrapper1.storageSize = 250;
        s3Wrapper1.requestedMonths = 1;
        s3Wrapper1.noPutCopyListRequests = 10;
        s3Wrapper1.noGetRequests = 12;
        OceanS3PricingWrapper s3Wrapper2 = new OceanS3PricingWrapper();
        s3Wrapper2.volumeType = 'One Zone - Infrequent Access';
        s3Wrapper2.region = 'US West (Oregon)';
        s3Wrapper2.storageSize = 250;
        s3Wrapper2.requestedMonths = 1;
        s3Wrapper2.noPutCopyListRequests = 10;
        s3Wrapper2.noGetRequests = 12;       
        OceanS3PricingWrapper s3Wrapper3 = new OceanS3PricingWrapper();
        s3Wrapper3.volumeType = 'Amazon Glacier';
        s3Wrapper3.region = 'US West (Oregon)';
        s3Wrapper3.storageSize = 250;
        s3Wrapper3.requestedMonths = 1;
        s3Wrapper3.noPutCopyListRequests = 10;
        s3Wrapper3.noGetRequests = 12;
        OceanS3PricingWrapper s3Wrapper4 = new OceanS3PricingWrapper();
        s3Wrapper4.volumeType = 'Intelligent-Tiering Frequent Access';
        s3Wrapper4.region = 'US West (Oregon)';
        s3Wrapper4.storageSize = 250;
        s3Wrapper4.requestedMonths = 1;
        s3Wrapper4.noPutCopyListRequests = 10;
        s3Wrapper4.noGetRequests = 12;
        OceanS3PricingWrapper s3Wrapper5 = new OceanS3PricingWrapper();
        s3Wrapper5.volumeType = 'Intelligent-Tiering InFrequent Access';
        s3Wrapper5.region = 'US West (Oregon)';
        s3Wrapper5.storageSize = 250;
        s3Wrapper5.requestedMonths = 1;
        s3Wrapper5.noPutCopyListRequests = 10;
        s3Wrapper5.noGetRequests = 12;


        // For the class OceanEbsPricingWrapper
        OceanEbsPricingWrapper ebsWrapper = new OceanEbsPricingWrapper();
        ebsWrapper.numberOfMonths = 1;
        ebsWrapper.region = 'US West (Oregon)';
        ebsWrapper.volumeType = 'General Purpose';
        ebsWrapper.storageMedia = 'SSD-backed';
        ebsWrapper.storageSize = 200;
        ebsWrapper.noOfVolume = 1;
        ebsWrapper.snapshotStorage = 200;
        ebsWrapper.snapshotFrequency = 'Monthly';
        ebsWrapper.averageDuration = 730;
        OceanEbsPricingWrapper ebsWrapper1 = new OceanEbsPricingWrapper();
        ebsWrapper1.numberOfMonths = 1;
        ebsWrapper1.region = 'US West (Oregon)';
        ebsWrapper1.volumeType = 'Provisioned IOPS';
        ebsWrapper1.storageMedia = 'SSD-backed';
        ebsWrapper1.storageSize = 200;
        ebsWrapper1.noOfVolume = 1;
        ebsWrapper1.snapshotStorage = 200;
        ebsWrapper1.snapshotFrequency = '2x Daily';
        ebsWrapper1.averageDuration = 730;

        // For the class OceanEMRPricingWrapper
        OceanEMRPricingWrapper emrWrapper = new OceanEMRPricingWrapper();
        emrWrapper.region = 'US East (N.Virginia)';
        emrWrapper.instanceType = 'c1.medium';
        emrWrapper.offeringClass = 'Standard';
        emrWrapper.termType = 'Reserved';
        emrWrapper.leaseContractLength = '1yr';
        emrWrapper.hadoopDistributionType = 'EMR';
        emrWrapper.purchaseOption = 'Partial Upfront';
        emrWrapper.instanceQuantity = 1;
        emrWrapper.uptimePerDay = 5;
        emrWrapper.uptimePerMonth = 15;
        emrWrapper.monthsRequested  = 1;
        
        // For the class OceanFileController
        Ocean_Request__c oceanReq = new Ocean_Request__c();
        oceanReq.Cloud_Service_Provider_Project_Number__c = '48';
        oceanReq.AWSInstances__c = 'EC2';
        oceanReq.ProjectName__c = 'Ocean';
        insert oceanReq;

        contentversion cv = new contentversion();
        cv.Title = 'Test';
        cv.PathOnClient = 'Test.txt';
        cv.FirstPublishLocationId = oceanReq.Id;
        cv.VersionData = EncodingUtil.base64Decode('Test');
        cv.IsMajorVersion = true;
        cv.SAVI_File_Scan_Status__c = 'Clean';
        insert cv;

        contentversion cv1 = new contentversion();
        cv1.Title = 'Test';
        cv1.PathOnClient = 'Test.txt';
        cv1.FirstPublishLocationId = oceanReq.Id;
        cv1.VersionData = EncodingUtil.base64Decode('Test');
        cv1.IsMajorVersion = true;
        cv1.SAVI_File_Scan_Status__c = '';
        insert cv1;

        FileUploadWrapper fileWrapper = new FileUploadWrapper();
        fileWrapper.id = cv.Id;
        fileWrapper.url = '/sfc/servlet.shepherd/document/download/'+cv.ContentDocumentId;
        fileWrapper.title = cv.Title;
        fileWrapper.contentDocumentId = cv.ContentDocumentId;
        fileWrapper.scanStatus = cv.SAVI_File_Scan_Status__c;
        List<Id> idList = new List<Id>();
        idList.add(cv.id);
        List<Id> idList1 = new List<Id>();
        idList1.add(cv1.id);
        
        sfc.ContentDownloadContext context;
        SAVIContentDownloadHandlerFactoryImpl downloadHandler = new SAVIContentDownloadHandlerFactoryImpl();
        downloadHandler.getContentDownloadHandler(idList,context);
        downloadHandler.getContentDownloadHandler(idList1,context);
        SAVIRequestMock fakeResponse = new SAVIRequestMock(200,
                                                                   'Complete',
                                                                   '{"Name": "sForceTest1"}',
                                                                   null);
        Test.setMock(HttpCalloutMock.class, fakeResponse);      

        OceanFileController.saveFile(oceanReq.Id, 'fileType','strFileName');     
        OceanFileController.relatedFiles(oceanReq.Id);

        AVCallbackResponse.saviCallbackResponse();
        SAVIFileScan.getFileScanResults(cv.id);
        SAVIFileScan.getFileScanSettings();
        SAVIFileScan.fileScanLog(cv.id, 'File sent for scanning');
        
        // For the Class OceanAwsPricingData
        AWS_PRICING_EFS__c efsAWS = new AWS_PRICING_EFS__c();
        efsAWS.Location__c = 'US East (N.Virginia)';
        efsAWS.StorageClass__c = 'General Purpose';
        efsAWS.Operation__c ='';
        efsAWS.AccessType__c = '';
        insert efsAWS;

        AWS_PRICING_DATA_TRANSFER__c dtAWS = new AWS_PRICING_DATA_TRANSFER__c();
        dtAWS.FromLocation__c = 'US East (N.Virginia)';
        dtAWS.ToLocation__c = 'US West (Oregon)';
        dtAWS.TransferType__c = 'IntraRegion';
        insert dtAWS;

        OceanAwsPricingData controller = new OceanAwsPricingData();
        OceanAwsPricingData.getEc2ComputePrice(ec2Wrapper);
        OceanAwsPricingData.getRdsRequestPrice(rdsWrapper);
        OceanAwsPricingData.getWorkspaceRequestPrice(wrkspaceWrapper);
        OceanAwsPricingData.getDynamoDBPrice(dynamoWrapper);
        OceanAwsPricingData.getDynamoDBPrice(dynamoWrapper1);
        OceanAwsPricingData.getDynamoDBPrice(dynamoWrapper2);
        OceanAwsPricingData.getRedshiftRequestPrice(rsWrapper);
        OceanAwsPricingData.getEmrRequestPrice(emrWrapper);
        OceanAwsPricingData.getLambdaRequestPrice('US East (N.Virginia)');
        OceanAwsPricingData.getEfsRequestPrice(efsAWS.StorageClass__c, efsAWS.Location__c);
        Decimal s3price = 0;
        s3price = OceanAwsPricingData.getS3RequestPrice(s3Wrapper);
        s3price = OceanAwsPricingData.getS3RequestPrice(s3Wrapper1);
        s3price = OceanAwsPricingData.getS3RequestPrice(s3Wrapper2);
        s3price = OceanAwsPricingData.getS3RequestPrice(s3Wrapper3);
        s3price = OceanAwsPricingData.getS3RequestPrice(s3Wrapper4);
        s3price = OceanAwsPricingData.getS3RequestPrice(s3Wrapper5);
        OceanAwsPricingData.getEbsStoragePrice(ebsWrapper);  
        OceanAwsPricingData.getEbsStoragePrice(ebsWrapper1);                    
        OceanAwsPricingData.getDataTransferRequestPrice('IntraRegion', 'US East (N.Virginia)');
        OceanAwsPricingData.getElbRequestPrice('Load Balancer','US East (N.Virginia)');
        OceanAwsPricingData.getRdsBkupRequestPrice('US East (N.Virginia)', 'Standard Backup');

        test.stopTest();       
    }
}