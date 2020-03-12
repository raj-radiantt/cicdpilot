public with sharing class OceanCRRUIController {
    @AuraEnabled(cacheable = true)
    public static List<Ocean_CRR_UI_Metadata__c> getCRRUIMetadata(){
        List<Ocean_CRR_UI_Metadata__c> metadataList = [SELECT Id,Name,AWS_Instance__c,Create_Fields__c,Display_Fields__c,Edit_Fields__c,Sequence_Number__c,Object_API_Name__c,View_Fields__c FROM Ocean_CRR_UI_Metadata__c];
        return metadataList;
    }
}