@isTest
public with sharing class Test_OceanController {
    public static testMethod void oceanControllerTest(){
        test.startTest();
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        insert oceanRequest;

        OceanController.getOceanRequestById(oceanRequest.id);
        OceanController.getApprovalHistory(oceanRequest.id);
        OceanController.getResourceRequestSummary(oceanRequest.Id);
        OceanController.getCostAndCount('OCEAN_Ec2Instance__c', oceanRequest.Id);
        OceanController.getCurrentOceanWave();
        OceanController.getAdminReviewStages();
        OceanController.getWaveDetails();

        test.stopTest();
    }
}
