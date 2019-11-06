@RestResource(urlMapping='/callBackResponse')
global class AVCallbackResponse {
  @HttpPost
  global static string saviCallbackResponse()
  { 
    string result = 'SAVI Received the Request';
   try
   {
    String bodyRESTRequest = System.RestContext.request.requestBody.toString();
    Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(bodyRESTRequest);
    String fileName = String.valueOf(results.get('fileContentVersionID'));
    ContentVersion cv = [SELECT Id,FileExtension,Title,ContentDocumentId,SAVI_File_Scan_Status__c,SAVI_Scan_Status_Log__c from ContentVersion WHERE Id=:fileName];
    if(results.keySet()!=null){
                  cv.SAVI_File_Scan_Status__c= String.valueOf(results.get('scanStatus'));
        		  cv.SAVI_Scan_Date__c = Date.valueOf(String.valueOf(results.get('lastScanDate')));
    }       
   }
   catch(system.Exception Ex)
   {
    result = 'SAVI Request Errored';
   }
   return result;  
  } 
}