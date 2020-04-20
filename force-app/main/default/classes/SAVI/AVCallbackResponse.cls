/***********************************************************************************************************
Class Name: AVCallbackResponse Version: 1.0
Purpose: This is the WebService class(REST API) Which is called from the SAVI service to get the scan status 
and scan date and update each File(contentVersion) with the received value.
By: Subha Janarthanan(subha@radiantt.com)
************************************************************************************************************/

@RestResource(urlMapping='/fileStatusUpdate')
global with sharing class AVCallbackResponse {
  @HttpPost
  global static string saviCallbackResponse()
  { 
    string result = 'SAVI Received the Request';
    ContentVersion cv = new ContentVersion();
   try
   {
    String bodyRESTRequest = System.RestContext.request.requestBody.toString(); // The result from the SAVI Service
    Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(bodyRESTRequest);
    String fileName = String.valueOf(results.get('contentVersionId'));
    cv = [SELECT Id,FileExtension,Title,ContentDocumentId,SAVI_File_Scan_Status__c,SAVI_Scan_Status_Log__c from ContentVersion WHERE Id=:fileName WITH SECURITY_ENFORCED];
    if(results.keySet()!=null){
            cv.SAVI_File_Scan_Status__c= String.valueOf(results.get('scanStatus'));
            cv.SAVI_Scan_Date__c = (DateTime)JSON.deserialize(JSON.serialize(results.get('lastScanDate')),Datetime.class);
            cv.SAVI_Scan_Status_Log__c = 'File Scanned Successfully';
            if (Schema.sObjectType.ContentVersion.fields.SAVI_File_Scan_Status__c.isUpdateable() &&
            Schema.sObjectType.ContentVersion.fields.SAVI_Scan_Date__c.isUpdateable()){ 
              update cv;
            }
    }       
   }
   catch(system.Exception Ex)
   {
    result = 'SAVI Request Errored';
   }
 // SAVIFileScan.refreshPage(cv.id); // Added to try the refresh of the page after update.
  return result;    
  } 
}