global with sharing class DeleteCSVFilesBatch implements Database.Batchable<sObject>{
    List<String> csvFiles = new List<String>{'ApprovedCloudResourceRequests','ModifiedEC2Records'};
    Ocean_Report__c oceanR = [SELECT Id,Created_Date__c FROM Ocean_Report__c LIMIT 1];
    string repId = oceanR.id;
    List<ContentDocumentLink> cdlList = [SELECT Id, ContentDocumentId, ContentDocument.Title FROM ContentDocumentLink WHERE LinkedEntityId =: repId AND ContentDocument.Title IN: csvFiles];  
    
    public Database.QueryLocator start(Database.BatchableContext context)
    {     
        List<Id> idList = new List<Id>();
        for(ContentDocumentLink cdl : cdlList){
            idList.add(cdl.ContentDocumentId);
        }
        return Database.getQueryLocator('SELECT Id FROM ContentDocument WHERE Id IN: idList');
    }

    public void execute(Database.BatchableContext context, List<SObject> scope)
    {
        delete scope;
    }

    public void finish(Database.BatchableContext bc){

    }
}