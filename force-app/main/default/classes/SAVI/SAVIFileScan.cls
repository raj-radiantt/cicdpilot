/******************************************************************************************************************
Class Name: SAVIFileScan Version: 1.0
Purpose: This is the Handler Class Which is called from the AVContentVersionTrigger to get the accessToken from the 
SAVI Service and once authorized send the file for scanning by the SAVI.
By: Subha Janarthanan(subha@radiantt.com)
*******************************************************************************************************************/

public with sharing class SAVIFileScan {
   // Query to get the Http Request details for File Scan which are stored in the custom metadata type.
    public static SAVI__mdt getFileScanSettings(){
        SAVI__mdt fileScanSettings = [SELECT DeveloperName,MasterLabel,BaseURL__c,Endpoint__c,AuthType__c,Method__c FROM SAVI__mdt WHERE MasterLabel= 'FileScan'];
        return fileScanSettings;
    }
    // Query to get the Http Request details to authorize the connection which are stored in the custom metadata type.
    public static SAVI__mdt getAuthRequestSettings(){
        SAVI__mdt authRequestSettings = [SELECT DeveloperName,MasterLabel,BaseURL__c,Endpoint__c,AuthType__c,ClientId__c,ClientSecret__c,Method__c FROM SAVI__mdt WHERE MasterLabel= 'AuthRequest'];
        return authRequestSettings;
    }

    // This is an asynchronous call to SAVI for sending the "Id" of the file(contentversion) which needs to be scanned.
    @future(callout=true)
    public static void getFileScanResults(Set<Id> contentVersionIdList){
        List<Id> idList = new List<Id>();
        idList.addAll(contentVersionIdList);
        List<ContentVersion> contentVersionList = new List<ContentVersion>();
        
        contentVersionList = [SELECT Id FROM ContentVersion WHERE Id IN: idList WITH SECURITY_ENFORCED];

        SAVI__mdt saviAuthRequestSettings = getAuthRequestSettings(); 
        String authEndPoint = String.format('{0}{1}', new string[]{saviAuthRequestSettings.BaseURL__c, saviAuthRequestSettings.Endpoint__c});
        String authorization = String.format('{0}:{1}', new string[]{saviAuthRequestSettings.ClientId__c,saviAuthRequestSettings.ClientSecret__c});
        String authHeader = String.format('{0} {1}',new string[]{saviAuthRequestSettings.AuthType__c,EncodingUtil.base64Encode(Blob.valueOf(authorization))});
        
        string accessToken;
        accessToken = getAccessToken(authEndPoint,authHeader); // calls the 'getAccessToken' method to get the authorized token
        
        if(Test.isRunningTest()){
            accessToken = 'test-token-will-not-be-used';
         }
                
        SAVI__mdt savifileScanSettings = getFileScanSettings();
        string endPoint = String.format('{0}{1}', new string[]{savifileScanSettings.BaseURL__c, savifileScanSettings.Endpoint__c});
        string authHeaderFileScan = String.format('{0} {1}',new string[]{savifileScanSettings.AuthType__c,accessToken});

        for(ContentVersion cv : contentVersionList){            
            try{
                if(!string.isBlank(accessToken)) {
                    HttpRequest request = new HttpRequest();                  
                    request.setEndpoint(endPoint+'?contentVersionId='+cv.id);
                    request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                    request.setHeader('Authorization', authHeaderFileScan);
                    request.setMethod(savifileScanSettings.Method__c);

                    Http http = new Http();
                    HttpResponse response = http.send(request);
                    string responseStatusCode = String.valueof(response.getStatusCode()); 
                    string logMessage = (responseStatusCode == '200') ? 'File sent for scanning' : 'File could not be sent for scanning';           

                    cv.SAVI_Scan_Status_Log__c =  logMessage;
                }
            }
            catch(Exception ex){
                    cv.SAVI_Scan_Status_Log__c = ex.getMessage();
            }
        }
            if (Schema.sObjectType.ContentVersion.fields.SAVI_Scan_Status_Log__c.isUpdateable()){
                update contentVersionList;
            }
    }

    // Method to get the access token once the SAVI validates the credentials and authorize the connection between Salesforce and SAVI.
    public static String getAccessToken(String authEndPoint,String authHeader){
        HttpRequest request = new HttpRequest();
        request.setEndpoint(authEndPoint);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', authHeader);
        request.setBody('grant_type=client_credentials');
        request.setMethod('GET');

        Http http = new Http();
        HttpResponse response = http.send(request);
        string responseStatusCode = String.valueof(response.getStatusCode()); 
        string responseBody = String.valueof(response.getbody());

        Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(responseBody);
        return (responseStatusCode == '200') ? (String)results.get('access_token')  : null;
    }
}
