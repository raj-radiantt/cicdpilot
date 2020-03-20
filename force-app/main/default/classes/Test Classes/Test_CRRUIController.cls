@isTest
public with sharing class Test_CRRUIController {
    public static testMethod void testCRRUI() {
        test.startTest();
        Ocean_Request__c oceanReq = new Ocean_Request__c();
        oceanReq.Cloud_Service_Provider_Project_Number__c = '48';
        oceanReq.AWSInstances__c = 'EC2';
        oceanReq.ProjectName__c = 'Ocean';
        insert oceanReq;

        OceanCRRUIController.getCRRUIMetadata(oceanReq.id);
        test.stopTest();
    }
}
