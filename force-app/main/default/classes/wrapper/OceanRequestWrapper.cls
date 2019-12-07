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
    public String[] awsInstances { get; set; }
    @AuraEnabled
    public OceanApplicationWrapper applicationDetails { get; set; }
}
