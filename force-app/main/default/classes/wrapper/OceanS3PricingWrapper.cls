public with sharing class OceanS3PricingWrapper {
    @AuraEnabled
    public String volumeType { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public Double storageSize { get; set; }
    @AuraEnabled
    public long requestedMonths { get; set; }
    @AuraEnabled
    public long noPutCopyListRequests { get; set; }
    @AuraEnabled
    public long noGetRequests { get; set; }
}