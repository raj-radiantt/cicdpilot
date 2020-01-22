public with sharing class OceanExportRDSWrapper {
    @AuraEnabled 
    public String RDSId {get; set;}
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
    public String Deployment {get; set;}
    @AuraEnabled 
    public String AvailabilityZone {get; set;}
    @AuraEnabled 
    public Decimal InstanceQuantity {get; set;}
    @AuraEnabled 
    public String InstanceType {get; set;}
    @AuraEnabled 
    public String DBEngineAndLicense {get; set;}
    @AuraEnabled 
    public Decimal StorageSize {get; set;}
    @AuraEnabled 
    public String StorageType {get; set;}
    @AuraEnabled 
    public Decimal ProvisionedIOPS {get; set;}
    @AuraEnabled 
    public Decimal InstanceUptimeHoursPerDay {get; set;}
    @AuraEnabled 
    public Decimal InstanceUptimeDaysPerMonth {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public String FundingType {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
