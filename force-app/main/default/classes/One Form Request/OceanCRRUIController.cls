public with sharing class OceanCRRUIController {
    @AuraEnabled
    public static List<CRR_UI_Field__mdt> getCRRUIMetadata(Id reqId){
        Ocean_Request__c oceanReq =[SELECT Id,name,AWSInstances__c FROM Ocean_Request__c WHERE id=:reqId];
        String[] awsInstances = oceanReq.AWSInstances__c.split(';');
        List<CRR_UI_Field__mdt> metadataList = [SELECT MasterLabel,DeveloperName,Field_API_Name__c,Create__c,Edit__c,View__c,Display__c,Sequence__c,CRR_UI_Metadata__r.AWS_Resource_Name__c,CRR_UI_Metadata__r.Resource_API_Name__c FROM CRR_UI_Field__mdt
        WHERE CRR_UI_Metadata__r.AWS_Resource_Name__c IN:awsInstances ];
        return metadataList;     
    }
}