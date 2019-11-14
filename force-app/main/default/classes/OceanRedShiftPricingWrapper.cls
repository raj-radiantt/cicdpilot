public with sharing class OceanRedShiftPricingWrapper {
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
    public String productFamily = 'Compute Instance';
}
