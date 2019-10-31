public with sharing class OceanRDSPricingWrapper {
    @AuraEnabled
    public String databaseEngine { get; set; }
    @AuraEnabled
    public String licenseModel { get; set; }
    @AuraEnabled
    public String databaseEdition { get; set; }
    @AuraEnabled
    public String termType { get; set; }
    @AuraEnabled
    public String leaseContractLength { get; set; }
    @AuraEnabled
    public String purchaseOption { get; set; }
    @AuraEnabled
    public String offeringClass { get; set; }
    @AuraEnabled
    public String instanceType { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public String deploymentOption { get; set; }
}
