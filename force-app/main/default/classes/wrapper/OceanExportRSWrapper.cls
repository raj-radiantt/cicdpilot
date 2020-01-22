public with sharing class OceanExportRSWrapper {
    @AuraEnabled 
    public String RSId {get; set;}
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
    public String NodeType {get; set;}
    @AuraEnabled 
    public Decimal NodeQuantity {get; set;}
    @AuraEnabled 
    public Decimal UsageHoursPerDay {get; set;}
    @AuraEnabled 
    public Decimal UsageDaysPerMonth {get; set;}   
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String FundingType {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
