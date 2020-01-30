public with sharing class SAVIFileScan {
    private static SAVI__mdt getFileScanSettings(){
        SAVI__mdt fileScanSettings = [SELECT DeveloperName,MasterLabel,BaseURL__c,Endpoint__c,AuthType__c,Method__c FROM SAVI__mdt WHERE MasterLabel= 'FileScan'];
        return fileScanSettings;
    }

    @Future(Callout = true)
    public static void getAccessToken(){
        string accessToken = SAVIAuth.getAccessToken();
        if(string.isBlank(accessToken)) {
            HttpRequest request = new HttpRequest();
            SAVI__mdt savifileScanSettings = getFileScanSettings();
            string endPoint = String.format('{0}{1}', new string[]{savifileScanSettings.BaseURL__c, savifileScanSettings.Endpoint__c});
            string authHeader = String.format('{0} {1}',new string[]{savifileScanSettings.AuthType__c,accessToken});

            request.setEndpoint(endPoint);
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setHeader('Authorization', authHeader);
            request.setMethod(savifileScanSettings.Method__c);

            Http http = new Http();
            HttpResponse response = http.send(request);
            System.debug('response:::'+response);

            string responseStatusCode = String.valueof(response.getStatusCode()); 
            string responseBody = String.valueof(response.getbody());
            
        }
    }
}
