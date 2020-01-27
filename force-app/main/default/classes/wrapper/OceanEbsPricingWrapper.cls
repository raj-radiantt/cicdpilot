public with sharing class OceanEbsPricingWrapper {
    @AuraEnabled
    public Decimal numberOfMonths { get; set; }
    @AuraEnabled
    public String region { get; set; }
    @AuraEnabled
    public String volumeType { get; set; }
    @AuraEnabled
    public String storageMedia { get; set; }
    @AuraEnabled
    public Decimal storageSize { get; set; }
    @AuraEnabled
    public Decimal noOfVolume { get; set; }
    @AuraEnabled
    public Decimal snapshotStorage { get; set; }
    @AuraEnabled
    public Decimal iops { get; set; }
    @AuraEnabled
    public String snapshotFrequency { get; set; }
    @AuraEnabled
    public Decimal averageDuration { get; set; }
}
