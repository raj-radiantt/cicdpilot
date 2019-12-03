public with sharing class OceanUserAccessController {
    public OceanUserAccessController() {}

    @AuraEnabled
    public static List<Application_Point_of_Contact__c> getAppPOCs(){
        User u ;
        List<Application_Point_of_Contact__c> appPOCList;

        u = [Select Id,name,contactId from User where Id=: UserInfo.getUserId()];
        appPOCList = [SELECT Id,Name,Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c 
                      FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =: u.contactId];

        return appPOCList;
    }
}
