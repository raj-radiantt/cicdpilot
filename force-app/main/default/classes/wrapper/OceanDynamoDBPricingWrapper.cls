public with sharing class OceanDynamoDBPricingWrapper {
    @AuraEnabled
    public String termType { get; set; }
    @AuraEnabled
    public String numberOfMonths { get; set; }
    @AuraEnabled
    public String readUnits { get; set; }
    @AuraEnabled
    public String writeUnits { get; set; }
    @AuraEnabled
    public String dataStorage { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public String leaseContractLength { get; set; }
}