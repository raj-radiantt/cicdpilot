public with sharing class OceanAWSAccountWrapper {
    public OceanAWSAccountWrapper() {

    }
    @AuraEnabled
    public String id { get; set; }
    @AuraEnabled
    public String name { get; set; }
}
