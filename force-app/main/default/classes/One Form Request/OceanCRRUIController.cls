public with sharing class OceanCRRUIController {
    @AuraEnabled(cacheable = true)
    public static List<Ocean_CRR_UI_Metadata__c> getCRRUIMetadata(){
        List<Ocean_CRR_UI_Metadata__c> metadataList = [SELECT Id,Name,Resource_API_Name__c,AWS_Resource_Name__c,(SELECT Id,Name,Field_API_Name__c,Create__c,Display__c,Edit__c,Sequence__c,View__c FROM OCEAN_CRR_UI_Fields__r) FROM Ocean_CRR_UI_Metadata__c];
        return metadataList;
    }
}