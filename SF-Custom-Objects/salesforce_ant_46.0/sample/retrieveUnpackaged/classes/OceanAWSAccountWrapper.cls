public with sharing class OceanAWSAccountWrapper {
    public OceanAWSAccountWrapper() {

    }
    @AuraEnabled
    public String value { get; set; }
    @AuraEnabled
    public String label { get; set; }
}