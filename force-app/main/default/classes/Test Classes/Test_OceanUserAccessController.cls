@isTest
public with sharing class Test_OceanUserAccessController {
    public static testMethod void oceanUserAccessControllerTest() {
        test.startTest();

        Ocean_Wave__c currentWave = new Ocean_Wave__c();
        currentWave.Active_Wave__c = true;
        currentWave.Wave_Start_Date__c = System.today();
        currentWave.Wave_End_Date__c = System.today() + 90;
        insert currentWave;

        Applications__c app = TestDataFactory.getApplication();
        User u = OceanUserAccessController.getCurrentUser();
        Application_Point_of_Contact__c appPOC = new Application_Point_of_Contact__c();
        appPOC.Applications__c = app.id;
        appPOC.Point_Of_Contact__c = u.ContactId;
        appPOC.Roles__c = 'ADO';
        insert appPOC;
        
        UserRoleAccess__c roleAccess = new UserRoleAccess__c();
        roleAccess.Name = 'ADO';
        roleAccess.Approve__c = false;
        roleAccess.FileUpload__c = true;
        roleAccess.CRMTFileUpload__c = false;
        roleAccess.Approve_Request_Submission__c = false;
        roleAccess.Create__c = true;
        roleAccess.Hierarchy__c = '1'; 
        roleAccess.Review__c = false;
        insert roleAccess;

        OceanUserAccessController.getCurrentUser();
        OceanUserAccessController.getApplications();
        OceanUserAccessController.getCurrentWave();
        OceanUserAccessController.getUserRoleAccess(app.id);
        OceanUserAccessController.getDraftRequests();
        OceanUserAccessController.getSubmittedRequests();
        OceanUserAccessController.getApprovedRequests();
        test.stopTest();
    }
}
