public with sharing class OceanExportQSWrapper {
    @AuraEnabled 
    public String QSId {get; set;}
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
    public Decimal NoOfUsers {get; set;}
    @AuraEnabled 
    public String UserType {get; set;}
    @AuraEnabled 
    public String SubModel {get; set;}
    @AuraEnabled 
    public Decimal NoOfSessions {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
