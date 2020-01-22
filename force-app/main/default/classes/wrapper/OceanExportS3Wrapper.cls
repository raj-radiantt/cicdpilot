public with sharing class OceanExportS3Wrapper {
    @AuraEnabled 
    public String S3Id {get; set;}
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
    public Decimal PUTCOPYPOSTLISTRequests {get; set;}
    @AuraEnabled 
    public Decimal GETSELECTOtherRequests  {get; set;}
    @AuraEnabled 
    public Decimal NoOfLifecycleTransitionRequests {get; set;}
    @AuraEnabled 
    public Decimal PercentStorageNotAccessed30Days {get; set;}
    @AuraEnabled 
    public String DataRetrievalType {get; set;}
    @AuraEnabled 
    public Decimal DataRetrievalGBMonth {get; set;}
    @AuraEnabled 
    public Decimal NoOfObjectsMonitoredMonth {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
