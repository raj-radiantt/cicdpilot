public with sharing class OceanAllRequests {
    @AuraEnabled(cacheable=true)
    public static List<OCEAN_Request__c> getDraftRequests(String status){
        return[SELECT CreatedDate, ADOName__c, AWSInstances__c, Application_Acronym__c,Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c, Option_Year__c, Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave_Submitted__c FROM OCEAN_Request__c WHERE Request_Status__c = :status ORDER BY Submitted_Date__c];
    }
    @AuraEnabled(cacheable=true)
    public static SObject getOceanRequestById(String id){
    SObject o =  [SELECT CreatedDate, ADOName__c, AWSInstances__c, Application_Acronym__c,Application_Name__c, Assumptions__c, AWSAccountName__c, Cloud_Service_Provider_Project_Number__c, Current_Approved_Resources__c, MonthsInPoP__c, No_Additional_Funding_Requested__c, Number_of_AWS_Accounts__c, Option_Year__c, Option_Year_End_Date__c, Option_Year_Start_Date__c, PeriodOfPerformance__c, ProjectName__c, Request_Status__c, Submitted_Date__c, Total_Estimated_Amount__c, Wave_Submitted__c FROM OCEAN_Request__c WHERE Id = :id ];
    return o;
    }
}
