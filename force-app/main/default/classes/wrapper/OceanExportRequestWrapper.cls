public with sharing class OceanExportRequestWrapper extends OceanExportWrapper {
    @AuraEnabled 
    public String RequestId {get; set;}
    @AuraEnabled 
    public String RequestStatus {get; set;}
    @AuraEnabled 
    public String AWSInstances {get; set;}
    @AuraEnabled 
    public String Assumptions {get; set;} 
    @AuraEnabled 
    public String CreatedDate {get; set;} 
    @AuraEnabled 
    public String SubmittedDate {get; set;} 
}
