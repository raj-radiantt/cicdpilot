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
    public String projectName {get; set;} 
    @AuraEnabled 
    public List<OceanAWSAccountWrapper> awsAccounts {get; set;}
    @AuraEnabled
    public OceanWaveWrapper wave {get; set;}
}