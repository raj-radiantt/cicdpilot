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
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE ORDER BY Name ASC];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id, Name, Primary_ADO__r.Name, Wave__c, Primary_ADO__c, Project_Acronym__r.Name, Project_Acronym__r.Project_Number__c, Application_Acronym__c, CSP_Option_Year__c FROM Applications__c WHERE ID IN :AppId];                    
    }

    @AuraEnabled(cacheable = true)
    public static Ocean_Wave__c getCurrentWave(){
        return [SELECT Id, Name, Active_Wave__c, CSP_Option_Year__c, CSP_Option_Year__r.Name, CSP_Option_Year__r.Remaining_Months_in_OY__c, Option_Year_End_Date__c,
                                     Option_Year_Start_Date__c, Wave_Start_Date__c, Wave_End_Date__c
                                     FROM Ocean_Wave__c WHERE Active_Wave__c = TRUE LIMIT 1];    
    }

    @AuraEnabled(cacheable = false)
    public static string getRole(String appId){
        User u = getCurrentUser();
        Application_Point_of_Contact__c app = [SELECT Id, Name, Applications__c,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Applications__c =: AppId LIMIT 1 ];    
        String Role;
        if(app.ADO__c == true)
            Role = 'ADO';
        else if(app.COR_GTL__c == true) 
            Role = 'COR/GTL';
        else if(app.CRMS__c == true)
            Role = 'CRMS';
        else if(app.CRMT__c == true)
            Role = 'CRMT';
        else if(app.Read_Only__c == true)
            Role = 'ReadOnly';

        return Role;       
    }

    @AuraEnabled(cacheable = false)
    public static List<OCEAN_Request__c> getDraftRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,Name,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, App_Team_Request_Status__c,ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,OY_End_Date__c, OY_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c = 'Draft' AND ApplicationName__c IN :AppId ORDER BY Submitted_Date__c];       
    }

    @AuraEnabled(cacheable = false)
    public static List<OCEAN_Request__c> getSubmittedRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,Name,ADO_Name__c,CreatedDate,  LastModifiedDate, AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,OY_End_Date__c, OY_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c,App_Team_Request_Status__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c NOT IN ('Approved', 'Draft') AND ApplicationName__c IN :APPId ORDER BY Submitted_Date__c];       
    }

    @AuraEnabled(cacheable = false)
    public static List<OCEAN_Request__c> getApprovedRequests(){
        User u = getCurrentUser();
        List<Application_Point_of_Contact__c> appList = [SELECT Id, Name, Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c
                              FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =:u.contactId AND Read_Only__c = FALSE];    
        List<Id> AppId = new List<Id>();
        for(Application_Point_of_Contact__c appPOC : appList){
            AppId.add(appPOC.Applications__c);
        }
        return [SELECT Id,Name,ADO_Name__c,CreatedDate,  LastModifiedDate, App_Team_Request_Status__c,AWSInstances__c, Application_Name__c, ApplicationName__c,Assumptions__c, Cloud_Service_Provider_Project_Number__c,  Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c,OY_End_Date__c, OY_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave__c,Total_Estimated_Cost__c FROM OCEAN_Request__c WHERE Request_Status__c = 'Approved' AND ApplicationName__c IN :APPId ORDER BY Submitted_Date__c];       
    }

    @AuraEnabled(cacheable = true)
    public static List<Application_Point_of_Contact__c> getAppPOCs(){  
        User u = getCurrentUser();            
        return [SELECT Id,Name,Applications__c,Applications__r.Id,COR_GTL__c,CRMS__c,ADO__c,CRMT__c,Point_Of_Contact__c,Read_Only__c 
                      FROM Application_Point_of_Contact__c WHERE Point_Of_Contact__c =: u.contactId];
    }

    @AuraEnabled(cacheable = true)
    public static List<UserRole__c> getADORoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'ADO' ];
    }

    @AuraEnabled(cacheable = true)
    public static List<UserRole__c> getCORGTLRoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'COR/GTL' ];
    }

    @AuraEnabled(cacheable = true)
    public static List<UserRole__c> getCRMSRoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'CRMS' ];
    }

    @AuraEnabled(cacheable = true)
    public static List<UserRole__c> getCRMTRoleAttributes(){
        return [SELECT Id,Name,Approve_Request_Submission__c,Create__c,Review__c,Approve__c FROM UserRole__c WHERE name = 'CRMT' ];
    }

}