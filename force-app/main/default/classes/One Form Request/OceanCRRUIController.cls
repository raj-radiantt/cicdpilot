public with sharing class OceanCRRUIController {
    @AuraEnabled
    public static List<CRR_UI_Metadata__mdt> getCRRUIMetadata(Id reqId){
        Ocean_Request__c oceanReq =[SELECT Id,name,AWSInstances__c FROM Ocean_Request__c WHERE id=:reqId];
        String[] awsInstances = oceanReq.AWSInstances__c.split(';');
        List<CRR_UI_Metadata__mdt> metadataList = [SELECT MasterLabel, DeveloperName, AWS_Resource_Name__c, Resource_API_Name__c,
        (SELECT MasterLabel,DeveloperName,Field_Type__c,Field_API_Name__c,Create__c,Edit__c,View__c,Display__c,Sequence__c FROM CRR_UI_Field__r) 
        FROM CRR_UI_Metadata__mdt WHERE AWS_Resource_Name__c IN:awsInstances];
        return metadataList;     
    }
}