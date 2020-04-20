
global with sharing class DeleteCSVFilesBatch implements Database.Batchable<sObject>{
    public Database.QueryLocator start(Database.BatchableContext context)
    {
        List<String> csvFiles = new List<String>{'ApprovedCloudResourceRequests','ModifiedEC2Records'};
        Ocean_Report__c oceanR = [SELECT Id,Created_Date__c FROM Ocean_Report__c LIMIT 1];
        return Database.getQueryLocator('SELECT Id, ContentDocument.Title FROM ContentDocumentLink WHERE LinkedEntityId =: oceanR.id  AND ContentDocument.Title IN: csvFiles');
    }

    public void execute(Database.BatchableContext context, List<SObject> records)
    {
        delete records;
    }

    public void finish(Database.BatchableContext bc){

    }
}