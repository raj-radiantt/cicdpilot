public with sharing class SAVIFileScan {
    @testVisible
    private static SAVI__mdt getFileScanSettings(){
        SAVI__mdt fileScanSettings = [SELECT DeveloperName,MasterLabel,BaseURL__c,Endpoint__c,AuthType__c,Method__c FROM SAVI__mdt WHERE MasterLabel= 'FileScan'];
        return fileScanSettings;
    }

    public static void fileScanLog(string contentVersionId, string message) {
        ContentVersion cv = [SELECT Id,FileExtension,Title,ContentDocumentId,SAVI_File_Scan_Status__c,SAVI_Scan_Status_Log__c from ContentVersion WHERE Id=:contentVersionId];
        if(cv != null) {
            if(cv.SAVI_Scan_Status_Log__c == null) {
                cv.SAVI_Scan_Status_Log__c =  message;
            }
            else {
                cv.SAVI_Scan_Status_Log__c += '\n' + message;
            }
            update cv;
        }
    }

    @Future(Callout = true)
    public static void getFileScanResults(string contentVersionId){
        string accessToken = SAVIAuth.getAccessToken();
        try{
            if(!string.isBlank(accessToken)) {
                HttpRequest request = new HttpRequest();
                SAVI__mdt savifileScanSettings = getFileScanSettings();
                string endPoint = String.format('{0}{1}?contentVersionId={2}', new string[]{savifileScanSettings.BaseURL__c, savifileScanSettings.Endpoint__c,contentVersionId});
                string authHeader = String.format('{0} {1}',new string[]{savifileScanSettings.AuthType__c,accessToken});

                request.setEndpoint(endPoint);
                request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                request.setHeader('Authorization', authHeader);
                request.setMethod(savifileScanSettings.Method__c);

                Http http = new Http();
                HttpResponse response = http.send(request);
                System.debug('response:::'+response);

                string responseStatusCode = String.valueof(response.getStatusCode()); 
                string logMessage = (responseStatusCode == '200') ? 'File sent for scanning' : 'File could not be sent for scanning';           

                fileScanLog(contentVersionId, logMessage);
            }
        }
        catch(Exception ex){
            fileScanLog(contentVersionId, ex.getMessage());
        }
    }
}
