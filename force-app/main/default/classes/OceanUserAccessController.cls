public with sharing class OceanUserAccessController {
    public OceanUserAccessController() {}

    @AuraEnabled(cacheable = true)
    public static User getCurrentUser(){
        User u;
        u = [SELECT Id, name, email, contactId from User where Id=: UserInfo.getUserId()];
        return u;
    }

    @AuraEnabled(cacheable = false)
    public static List<Applications__c> getApplications(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,Point_Of_Contact__c,Roles__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Roles__c != 'Read Only' ORDER BY Name ASC];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id, Name, Primary_ADO__r.Name, Primary_ADO__c, Project_Acronym__r.Name, Project_Acronym__r.Project_Number__c, Application_Acronym__c, CSP_Option_Year__c FROM Applications__c WHERE ID IN :AppId];                    
    }

    @AuraEnabled(cacheable = true)
    public static Ocean_Wave__c getCurrentWave(){
        return [SELECT Id, Name, Active_Wave__c, CSP_Option_Year__c, CSP_Option_Year__r.Name, CSP_Option_Year__r.Remaining_Months_in_OY__c, Option_Year_End_Date__c,
                                     Option_Year_Start_Date__c, Wave_Start_Date__c, Wave_End_Date__c
                                     FROM Ocean_Wave__c WHERE Active_Wave__c = TRUE LIMIT 1];    
    }

    @AuraEnabled(cacheable=true)
    public static OceanUserRoleAccessWrapper getUserRoleAccess(String appId){
        OceanUserRoleAccessWrapper access = new OceanUserRoleAccessWrapper();
        User u = getCurrentUser();
        Application_Point_of_Contact__c app = [SELECT Id, Name, Applications__c,Roles__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Applications__c =: appId LIMIT 1 ];    
        
        String Roles = app.Roles__c;
        List<String> Role = new List<String>();
        Role = Roles.split(';');

        UserRoleAccess__c roleAccess = [SELECT Id, Name, Approve__c, Approve_Request_Submission__c, Create__c, Hierarchy__c, Review__c  FROM UserRoleAccess__c WHERE Name IN: Role ORDER BY Hierarchy__c DESC LIMIT 1 ];

        access.userName = u.Name;
        access.userEmail = u.Email;
        access.role = roleAccess.Name;
        access.access = roleAccess;
        
        return access;
    }

    @AuraEnabled(cacheable = false)
    public static List<OCEAN_Request__c> getDraftRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,Point_Of_Contact__c,Roles__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Roles__c != 'Read Only'];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,Name,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,OY_End_Date__c, OY_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, CRMT_Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c = 'Draft' AND ApplicationName__c IN :AppId ORDER BY LastModifiedDate DESC];       
    }

    @AuraEnabled(cacheable = false)
    public static List<OCEAN_Request__c> getSubmittedRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,Point_Of_Contact__c,Roles__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Roles__c != 'Read Only'];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,Name,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,OY_End_Date__c, OY_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, CRMT_Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c NOT IN ('Approved', 'Draft') AND ApplicationName__c IN :APPId ORDER BY LastModifiedDate DESC];       
    }

    @AuraEnabled(cacheable = false)
    public static List<OCEAN_Request__c> getApprovedRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,Point_Of_Contact__c,Roles__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Roles__c != 'Read Only'];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,Name,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c,OY_End_Date__c, OY_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, CRMT_Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c = 'Approved' AND ApplicationName__c IN :APPId ORDER BY LastModifiedDate DESC];       
    }
    
}