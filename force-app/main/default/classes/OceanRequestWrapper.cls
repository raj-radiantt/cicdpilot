public with sharing class OceanRequestWrapper {
    public OceanRequestWrapper() {

    }
    @AuraEnabled
    public String id { get; set; }
    @AuraEnabled
    public String displayId { get; set; }
    @AuraEnabled
    public String requestStatus { get; set; }
    @AuraEnabled 
    public String CRMTStatus { get; set; }
    @AuraEnabled 
    public String reviewStage { get; set; }
    @AuraEnabled 
    public String comment { get; set; }
    @AuraEnabled 
    public String reviewOutcome { get; set; }
    @AuraEnabled
    public String[] awsInstances { get; set; }
    @AuraEnabled
    public OceanApplicationWrapper applicationDetails { get; set; }
}