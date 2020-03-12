public inherited sharing class OceanFileController {
   @AuraEnabled
    public static List<ContentVersion> saveFile(Id idParent, String fileType, String strFileName) {

        List<id> lstConDocs = new List<id>();
        List<contentversion> cvList = new List<contentversion>();

        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:idParent]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        system.debug('lstConDocs:::'+lstConDocs);

        if(!lstConDocs.isEmpty()) {
            cvList = [SELECT Id, Title, Ocean_Request_Id__c,Ocean_Request__c,Ocean_File_Type__c,ContentDocumentId, SAVI_File_Scan_Status__c FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs];
        }
              
        // updating file
        for (ContentVersion cv : cvList) {
            cv.Ocean_Request_Id__c = idParent;
            cv.Ocean_Request__c = idParent;
            cv.Ocean_File_Type__c = fileType;
            Id cdId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            ContentDocumentLink cdLnk = [SELECT Id,LinkedEntityId,ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: idParent AND ContentDocumentId =: cdId];
            cdLnk.ShareType = 'V';
            cdLnk.Visibility = 'AllUsers';
            update cdLnk;
        }       
        update cvList;
        return cvList;
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