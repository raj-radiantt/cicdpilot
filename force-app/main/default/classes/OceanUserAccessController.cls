public with sharing class OceanUserAccessController {
    public OceanUserAccessController() {}

    @AuraEnabled(cacheable = false)
    public static User getCurrentUser(){
        User u;
        u = [SELECT Id, name, email, contactId from User where Id=: UserInfo.getUserId()];
        return u;
    }

    @AuraEnabled
    public static List<Applications__c> getApplications(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c, Applications__r.Id, COR_GTL__c, CRMS__c, ADO__c, CRMT__c, Point_Of_Contact__c, Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id, Name, Primary_ADO__r.Name, Wave__c, Primary_ADO__c, Project_Acronym__r.Name, Project_Acronym__r.Project_Number__c, Application_Acronym__c, CSP_Option_Year__c FROM Applications__c WHERE ID IN :AppId];                    
    }

    @AuraEnabled
    public static List<OCEAN_Request__c> getDraftRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,OCEAN_REQUEST_ID__c,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c = 'Draft' AND ApplicationName__c IN :AppId ORDER BY Submitted_Date__c];       
    }

    @AuraEnabled
    public static List<OCEAN_Request__c> getSubmittedRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,OCEAN_REQUEST_ID__c,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c NOT IN ('Approved', 'Draft') AND ApplicationName__c IN :APPId ORDER BY Submitted_Date__c];       
    }

    @AuraEnabled
    public static List<OCEAN_Request__c> getApprovedRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,OCEAN_REQUEST_ID__c,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c = 'Approved' AND ApplicationName__c IN :APPId ORDER BY Submitted_Date__c];       
    }

    @AuraEnabled
    public static List<Application_Point_of_Contact__c> getAppPOCs(){  
        User u = getCurrentUser();            
        return [SELECT Id,Name,Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c 
                      FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =: u.contactId];
    }

    @AuraEnabled
    public static List<UserRole__c> getADORoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'ADO' ];
    }

    @AuraEnabled
    public static List<UserRole__c> getCORGTLRoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'COR/GTL' ];
    }

    @AuraEnabled
    public static List<UserRole__c> getCRMSRoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'CRMS' ];
    }

    @AuraEnabled
    public static List<UserRole__c> getCRMTRoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'CRMT' ];
    }

}
