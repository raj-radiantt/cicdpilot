@isTest
public with sharing class Test_OceanApprovalProcess {
    public static testMethod void oceanApprovalProcessTest() {
        test.startTest();
        CollaborationGroup crmsGroup = new CollaborationGroup();
        crmsGroup.name = 'Cloud Resource Management Support Team';
        crmsGroup.CollaborationType = 'Public';
        insert crmsGroup;

        CollaborationGroup crmtGroup = new CollaborationGroup();
        crmtGroup.name = 'Cloud Resource Management Team';
        crmtGroup.CollaborationType = 'Public';
        insert crmtGroup;
        system.debug('crmtGroup:::'+crmtGroup.id);

        Network myNetwork = [SELECT Id,name FROM Network WHERE Name = 'ocean-crm' LIMIT 1];
        system.debug('myNetwork:::'+myNetwork);
        Applications__c app = TestDataFactory.getApplication();
        OCEAN_Request__c oceanRequest = TestDataFactory.getOceanRequest();

        OCEAN_Request__c oceanRequest1 = TestDataFactory.getNextOceanRequest();
        OCEAN_Request__c oceanRequest2 = TestDataFactory.getOceanRequestCORGTL();
        
        List<OCEAN_Request__c> oceanRequestList = new List<Ocean_Request__c>();
        oceanRequestList.add(oceanRequest);
        List<OCEAN_Request__c> oceanRequestList1 = new List<Ocean_Request__c>();
    //    oceanRequestList1.add(oceanRequest1);
        oceanRequestList1.add(oceanRequest2);
        
        OceanApprovalProcess controller = new OceanApprovalProcess();
        controller.submitForIntakeReview(oceanRequest);
        controller.approveIntakeReview(oceanRequest);
        controller.rejectIntakeReview(oceanRequest);       
       // controller.CRMTAdminReview(oceanRequestList,oceanRequestList1);
        
        test.stopTest();
    }
}
