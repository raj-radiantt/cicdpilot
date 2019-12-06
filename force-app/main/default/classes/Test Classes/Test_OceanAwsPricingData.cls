@isTest
public class Test_OceanAwsPricingData {
    
    public static testMethod void awsPricingDataTest(){
        test.startTest();
        // For the Class OceanDataOptions
        OceanDataOptions.getAwsEc2Types();
        
        // For the Class OceanEc2PricingWrapper
        OceanEc2PricingWrapper controller = new OceanEc2PricingWrapper();
        controller.instanceType = 'Test Instance Type';
        controller.leaseContractLength = '12 months';
        controller.offeringClass = 'Test Offering Class';
        controller.platform = 'Salesforce';
        controller.preInstalledSW = 'Test Software';
        controller.purchaseOption = 'Cash';
        controller.region = 'Test Region';
        controller.tenancy = 'Test Tenacy';
        controller.termType = 'Test Term';
        
        // For the class OceanRDSPricingWrapper
        OceanRDSPricingWrapper ctrller = new OceanRDSPricingWrapper();
        ctrller.databaseEdition = 'Test DBEdition';
        ctrller.databaseEngine = 'Test DBEngine';
        ctrller.deploymentOption = 'Test Option';
        ctrller.instanceType = 'Test Instance Type';
        ctrller.leaseContractLength = '3 months';
        ctrller.licenseModel = 'License';
        ctrller.offeringClass = ' Test Class';
        ctrller.purchaseOption = 'Credit';
        ctrller.region = 'Test Region';
        ctrller.termType = 'Term';
        
        // For the class OceanWorkspacesPricingWrapper
        OceanWorkspacesPricingWrapper cont = new OceanWorkspacesPricingWrapper();
        cont.billingOption = 'Test Billing Option';
        cont.bundle = 'Test bundle';
        cont.license = 'Test License';
        cont.operatingSysytem = 'Test OS';
        cont.region = 'Test Region';
        cont.runningMode = 'Test running mode';
        cont.storage = 'Test Storage';
        
        // For the class OceanDynamoDBPricingWrapper
        OceanDynamoDBPricingWrapper contr = new OceanDynamoDBPricingWrapper();
        contr.dataStorage = 'Test Storage';
        contr.leaseContractLength = '6 months';
        contr.numberOfMonths = '6';
        contr.readUnits = 'Test Units';
        contr.region = 'Test region';
        contr.termType = 'Test Term';
        contr.writeUnits = 'Test Write Units';
        
        // For the class OceanRedShiftPricingWrapper
        OceanRedShiftPricingWrapper contrll = new OceanRedShiftPricingWrapper();
        contrll.instanceType = 'Test InstanceType';
        contrll.leaseContractLength = '1 Year';
        contrll.offeringClass = 'Test Offering Class';
        contrll.productFamily = 'Test Product';
        contrll.purchaseOption = 'Credit';
        contrll.region = 'Test Region';
        contrll.termType = 'Test Term Type';
        
        // For the class OceanFileController
        Ocean_Request__c oceanReq = new Ocean_Request__c();
        oceanReq.Cloud_Service_Provider_Project_Number__c = '48';
        oceanReq.ProjectName__c = 'Ocean';
        insert oceanReq;
        OceanFileController.saveFile(oceanReq.Id, 'fileType', oceanReq.Id, 'strFileName', 'base64Data');
        OceanFileController.releatedFiles(oceanReq.Id);
        
        // For the Class OceanAwsPricingData
       // OceanAwsPricingData.getDataTransferRequestPrice('IntraRegion', 'US East (N. Virginia)');\
       
        test.stopTest();       
    }
}