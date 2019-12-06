public with sharing class OceanApplicationWrapper {
    @AuraEnabled 
    public String id {get; set;}
    @AuraEnabled 
    public String name {get; set;}
    @AuraEnabled 
    public String adoName {get; set;}
    @AuraEnabled 
    public String acronym {get; set;}
    @AuraEnabled 
    public String projectNumber {get; set;}  
    @AuraEnabled 
    public List<String> awsAccounts {get; set;}
    @AuraEnabled
    public OceanWaveWrapper wave {get; set;}
}
