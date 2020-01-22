public with sharing class OceanExportDTWrapper {   
    @AuraEnabled 
    public String DTId {get; set;}
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
    public String DataTransferType {get; set;}
    @AuraEnabled 
    public Decimal DataTransferAmount {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
