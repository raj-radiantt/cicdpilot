public with sharing class OceanEbsPricingWrapper {
    @AuraEnabled
    public String numberOfMonths { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public String volumeType { get; set; }
    @AuraEnabled
    public String storageMedia { get; set; }
    @AuraEnabled
    public String storageSize { get; set; }
    @AuraEnabled
    public String noOfVolume { get; set; }
}
