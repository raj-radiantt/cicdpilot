@isTest
public with sharing class Test_OceanController {
    public static testMethod void oceanControllerTest(){
        test.startTest();
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        insert oceanRequest;

        OceanWaveWrapper waveWrapper = new OceanWaveWrapper();
        waveWrapper.isActive = true;
        waveWrapper.waveStartDate = system.today();
        // waveWrapper.waveEndDate = '2/30/2020';
        // waveWrapper.cspOY = '2020';
        // waveWrapper.oyEndDate = '12/31/2020';
        // waveWrapper.oyStartDate = '01/01/2020';
        // waveWrapper.oyMonthsRemaining = 11;

        Applications__c app = new Applications__c();
        insert app;

        OceanController.getOceanRequestById(oceanRequest.id);
        OceanController.getApprovalHistory(oceanRequest.id);
        OceanController.getResourceRequestSummary(oceanRequest.Id);
        OceanController.getCostAndCount('OCEAN_Ec2Instance__c', oceanRequest.Id);
        OceanController.getCurrentOceanWave();
        OceanController.getAdminReviewStages();
        OceanController.getApplicationDetails(app.id);
        OceanController.getWaveDetails();

        test.stopTest();
    }
}