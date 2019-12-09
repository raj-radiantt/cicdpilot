public with sharing class OceanUserRoleAccessWrapper {
    public OceanUserRoleAccessWrapper() {}
    
    @AuraEnabled
    public String userName {get; set;}
    @AuraEnabled
    public String userEmail {get; set;}
    @AuraEnabled
    public String Role {get; set;}
    @AuraEnabled
    public UserRoleAccess__c Access {get; set;}

}
