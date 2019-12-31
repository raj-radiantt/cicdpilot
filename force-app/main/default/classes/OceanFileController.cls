public inherited sharing class OceanFileController {
   @AuraEnabled
    public static ContentVersion saveFile(Id idParent, String fileType, String oceanReqId, String strFileName, String base64Data) {
        // Decoding base64Data
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        // inserting file
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = idParent;
        cv.Ocean_Request_Id__c = oceanReqId;
        cv.Ocean_Request__c = oceanReqId;
        cv.Ocean_File_Type__c = fileType;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        if (!Schema.sObjectType.ContentVersion.fields.title.isCreateable() || 
            !Schema.sObjectType.ContentVersion.fields.PathOnClient.isCreateable() || 
            !Schema.sObjectType.ContentVersion.fields.FirstPublishLocationId.isCreateable() || 
            !Schema.sObjectType.ContentVersion.fields.Ocean_Request_Id__c.isCreateable() ||
            !Schema.sObjectType.ContentVersion.fields.Ocean_Request__c.isCreateable() ||
            !Schema.sObjectType.ContentVersion.fields.Ocean_File_Type__c.isCreateable() ||
            !Schema.sObjectType.ContentVersion.fields.VersionData.isCreateable() ||
            !Schema.sObjectType.ContentVersion.fields.IsMajorVersion.isCreateable()){
            return null;
        }
        Insert cv;
        return cv;
    }

    @AuraEnabled
    public static list<contentversion> releatedFiles(Id idParent){
        list<id> lstConDocs = new list<id>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:idParent]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if(!lstConDocs.isEmpty()) {
            return [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs];
        }
        else {
            return null;
        }
     
    }
    
}