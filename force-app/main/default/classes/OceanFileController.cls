public inherited sharing class OceanFileController {
   @AuraEnabled
    public static ContentVersion saveFile(Id idParent, String fileType, String strFileName, String base64Data) {
        // Decoding base64Data
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        // inserting file
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = idParent;
        cv.Ocean_Request_Id__c = idParent;
        cv.Ocean_Request__c = idParent;
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
        insert cv;
        return cv;
    }

    @AuraEnabled
    public static List<FileUploadWrapper> relatedFiles(Id idParent){
        List<id> lstConDocs = new List<id>();
        List<contentversion> cvList = new List<contentversion>();
        List<FileUploadWrapper> fileWrapperList = new List<FileUploadWrapper>();

        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:idParent]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
 
        if(!lstConDocs.isEmpty()) {
            cvList = [SELECT Id, Title, ContentDocumentId, SAVI_File_Scan_Status__c FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs];
        }
        
        for (ContentVersion cv : cvList) {
            FileUploadWrapper fileWrapper = new FileUploadWrapper();
            fileWrapper.id = cv.Id;
            fileWrapper.url = '/sfc/servlet.shepherd/document/download/'+cv.ContentDocumentId;
            fileWrapper.title = cv.Title;
            fileWrapper.contentDocumentId = cv.ContentDocumentId;
            fileWrapper.scanStatus = cv.SAVI_File_Scan_Status__c;
            fileWrapperList.add(fileWrapper);
        }

        return fileWrapperList;   
    }
    
}