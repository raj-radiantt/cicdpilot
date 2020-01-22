public with sharing class OceanExportEMRWrapper {
    @AuraEnabled 
    public String EMRId {get; set;}
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
    public Decimal InstanceQuantity {get; set;}
    @AuraEnabled 
    public String InstanceType {get; set;}
    @AuraEnabled 
    public String HadoopDistribution {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public Decimal UptimeHoursPerDay {get; set;}
    @AuraEnabled 
    public Decimal UptimeDaysPerMonth {get; set;}
    @AuraEnabled 
    public String FundingType {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
