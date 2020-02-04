public with sharing class OceanEMRPricingWrapper {
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
    public String hadoopDistributionType { get; set; }
    @AuraEnabled 
    public String purchaseOption { get; set; }
    @AuraEnabled 
    public Decimal instanceQuantity { get; set; }
    @AuraEnabled 
    public Decimal uptimePerDay { get; set; }
    @AuraEnabled 
    public Decimal uptimePerMonth { get; set; }
    @AuraEnabled 
    public Decimal monthsRequested { get; set; }
}