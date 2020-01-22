public with sharing class OceanExportDynamoDBWrapper {
    @AuraEnabled 
    public String DynamoId {get; set;}
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
    public String CapacityType {get; set;}
    @AuraEnabled 
    public Decimal TotalDataStorage {get; set;}
    @AuraEnabled 
    public Decimal ReadCapacity {get; set;}
    @AuraEnabled 
    public Decimal WriteCapacity {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
