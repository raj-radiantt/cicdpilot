public with sharing class OceanEc2PricingWrapper {
    @AuraEnabled 
    public String platform { get; set; }
    @AuraEnabled 
    public String preInstalledSW { get; set; }
    @AuraEnabled 
    public String tenancy { get; set; }
    @AuraEnabled 
    public String region { get; set; }
    @AuraEnabled 
    public String instanceType { get; set; }
    @AuraEnabled 
    public String offeringClass { get; set; }
    @AuraEnabled 
    public String termType { get; set; }
    @AuraEnabled 
    public String leaseContractLength { get; set; }
    @AuraEnabled 
    public String purchaseOption { get; set; }
    @AuraEnabled
    public String capacityStatus = 'Used';
}