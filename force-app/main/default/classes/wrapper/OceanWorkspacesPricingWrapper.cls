public with sharing class OceanWorkspacesPricingWrapper {
    @AuraEnabled
    public String billingOption { get; set; }
    @AuraEnabled
    public String operatingSystem { get; set; }
    @AuraEnabled
    public String license { get; set; }
    @AuraEnabled
    public String storage { get; set; }
    @AuraEnabled
    public String bundle { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public String additionalStorage {get; set;}
    @AuraEnabled
    public String noOfWorkspaces {get; set;}
    @AuraEnabled
    public String monthsRequested {get; set;}
    @AuraEnabled
    public String hoursRequested {get; set;}
}