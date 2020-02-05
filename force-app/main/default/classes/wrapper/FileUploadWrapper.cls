public with sharing class FileUploadWrapper {
    @AuraEnabled
    public string id { get; set; }
    @AuraEnabled
    public string url { get; set; }
    @AuraEnabled
    public string title { get; set; }
    @AuraEnabled
    public string contentDocumentId { get; set; }
    @AuraEnabled
    public string scanStatus { get; set; }
}