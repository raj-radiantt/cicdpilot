public with sharing class OceanExportEFSWrapper {
    @AuraEnabled 
    public String EFSId {get; set;}
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
    public String StorageType {get; set;}
    @AuraEnabled 
    public Decimal TotalStorage {get; set;}
    @AuraEnabled 
    public Decimal ProvisionedThroughput {get; set;}
    @AuraEnabled 
    public Decimal InfrequentAccessRequests {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
