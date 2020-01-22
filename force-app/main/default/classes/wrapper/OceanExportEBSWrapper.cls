public with sharing class OceanExportEBSWrapper {
    @AuraEnabled 
    public String EBSId {get; set;}
    @AuraEnabled 
    public String AWSAccount {get; set;}
    @AuraEnabled 
    public String ResourceStatus {get; set;}
    @AuraEnabled 
    public String AppComponent {get; set;}
    @AuraEnabled 
    public String Environment {get; set;}
    @AuraEnabled 
    public String AWSRegion {get; set;}
    @AuraEnabled 
    public Decimal NoOfVolumes {get; set;}
    @AuraEnabled 
    public String VolumeType {get; set;}
    @AuraEnabled 
    public Decimal StorageSize {get; set;}
    @AuraEnabled 
    public Decimal IOPS {get; set;}
    @AuraEnabled 
    public Decimal SnapshotStorage {get; set;}
    @AuraEnabled 
    public String SnapshotFrequency {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
