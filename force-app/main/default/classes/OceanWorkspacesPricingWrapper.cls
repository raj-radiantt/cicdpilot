public with sharing class OceanWorkspacesPricingWrapper {
    @AuraEnabled
    public String billingOption { get; set; }
    @AuraEnabled
    public String operatingSysytem { get; set; }
    @AuraEnabled
    public String license { get; set; }
    @AuraEnabled
    public String storage { get; set; }
    @AuraEnabled
    public String bundle { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public String runningMode = 'AlwaysOn';
}
