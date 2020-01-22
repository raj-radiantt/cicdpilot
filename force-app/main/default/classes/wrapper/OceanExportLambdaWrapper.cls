public with sharing class OceanExportLambdaWrapper {
    @AuraEnabled 
    public String LambdaId {get; set;}
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
    public Decimal NoOfExecutions {get; set;}
    @AuraEnabled 
    public Decimal EstimatedExecution {get; set;}
    @AuraEnabled 
    public Decimal AllocatedMemory {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
