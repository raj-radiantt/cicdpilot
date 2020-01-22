public with sharing class OceanExportEc2Wrapper {
    @AuraEnabled 
    public String EC2Id {get; set;}
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
    public String Tenacy {get; set;}
    @AuraEnabled 
    public String AWSAvailabilityZone {get; set;}
    @AuraEnabled 
    public Decimal InstanceQuantity {get; set;}
    @AuraEnabled 
    public String InstanceType {get; set;}
    @AuraEnabled 
    public String Platform {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public Decimal InstanceHoursPerDay {get; set;}
    @AuraEnabled 
    public Decimal InstanceDaysPerMonth {get; set;}
    @AuraEnabled 
    public String BillingOption {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
