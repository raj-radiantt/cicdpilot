@isTest
public with sharing class Test_OceanController {
    public static testMethod void oceanControllerTest(){
        test.startTest();
        OCEAN_Request__c oceanRequest = new OCEAN_Request__c();
        oceanRequest.Cloud_Service_Provider_Project_Number__c = '48';
        oceanRequest.AWSInstances__c = 'EC2';
        oceanRequest.ProjectName__c = 'Ocean';
        oceanRequest.name = 'CRR-211';
        oceanRequest.Request_Status__c = 'Draft';
        oceanRequest.CRMT_Request_Status__c = 'Draft';
        oceanRequest.Review_Status__c = 'Draft';
        oceanRequest.Approval_Comments__c = 'Comments';
        oceanRequest.Review_Outcome__c = 'Approved';
        insert oceanRequest;

        Project__c proj = new Project__c();
        proj.Project_Number__c = '48';
        proj.name = 'OCEAN';
        insert proj;

        Applications__c app = new Applications__c();
        insert app;

        Option_Year__c oy = new Option_Year__c();
        oy.Option_Year_Start_Date__c = System.today();
        oy.Option_Year_End_Date__c = System.today() + 120;
        insert oy;

        Ocean_Wave__c wave = new Ocean_Wave__c();
        wave.name = 'Wave 2020';
        wave.Active_Wave__c = true;
        wave.ADO_Submission_Due_Date__c = Date.newInstance(2020, 12, 9);
        wave.Wave_Start_Date__c = system.today();
        wave.Wave_End_Date__c = System.today() + 90 ;
        insert wave;

        OceanRequestWrapper request = new OceanRequestWrapper();
        request.id = oceanRequest.Id;
        request.displayId = oceanRequest.Name;
        request.awsInstances = oceanRequest.AWSInstances__c.split(';');        
        request.requestStatus = oceanRequest.Request_Status__c;
        request.CRMTStatus = oceanRequest.CRMT_Request_Status__c;
        request.reviewStage = oceanRequest.Review_Status__c;
        request.comment = oceanRequest.Approval_Comments__c;
        request.reviewOutcome = oceanRequest.Review_Outcome__c;
        request.applicationDetails = getApplicationDetails(app.id);

        OceanWaveWrapper waveWrapper = new OceanWaveWrapper();
        waveWrapper.isActive = true;
        waveWrapper.waveStartDate = system.today();
        waveWrapper.waveEndDate = wave.Wave_Start_Date__c;
        waveWrapper.cspOY = '2020';
        waveWrapper.oyEndDate = oy.Option_Year_End_Date__c;
        waveWrapper.oyStartDate = oy.Option_Year_Start_Date__c;
        waveWrapper.oyMonthsRemaining = 11;
        
		List<OceanAWSAccountWrapper> awsWrapperList = new List<OceanAWSAccountWrapper>();
        OceanAWSAccountWrapper awsWrapper = new OceanAWSAccountWrapper();
        awsWrapper.label = 'aws-hhs-cms-cciio-regtap';
        awsWrapper.value = 'aws-hhs-cms-cciio-regtap';
        awsWrapperList.add(awsWrapper);
                        
        OceanApplicationWrapper appWrapper = new OceanApplicationWrapper();
        appWrapper.id = app.id;
        appWrapper.name = 'OCEAN';
        appWrapper.acronym = 'OCEAN';
        appWrapper.adoName = 'BJones';
        appWrapper.awsAccounts = awsWrapperList;
        appWrapper.projectName = proj.name;
        appWrapper.projectNumber = proj.Project_Number__c;
        
        OceanController.getApplicationDetails(app.id);
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