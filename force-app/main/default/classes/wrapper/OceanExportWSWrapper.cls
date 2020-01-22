public with sharing class OceanExportWSWrapper {
    @AuraEnabled 
    public String WSId {get; set;}
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
    public Decimal NoOfWorkspace {get; set;}
    @AuraEnabled 
    public String WorkspaceBundle {get; set;}
    @AuraEnabled 
    public String License {get; set;}
    @AuraEnabled 
    public String RootUserVolume {get; set;}
    @AuraEnabled 
    public String BillingOption {get; set;}
    @AuraEnabled 
    public Decimal AdditionalStorage {get; set;}
    @AuraEnabled 
    public Decimal NoOfMonthsRequested {get; set;}
    @AuraEnabled 
    public String ADONotes {get; set;}
    @AuraEnabled 
    public Decimal CalculatedCost {get; set;}
}
