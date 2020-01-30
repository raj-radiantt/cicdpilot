public with sharing class SAVIAuth {

    private static SAVI__mdt getAuthRequestSettings(){
        SAVI__mdt authRequestSettings = [SELECT DeveloperName,MasterLabel,BaseURL__c,Endpoint__c,AuthType__c,ClientId__c,ClientSecret__c,Method__c FROM SAVI__mdt WHERE MasterLabel= 'AuthRequest'];
        return authRequestSettings;
    }

    @Future(Callout = true)
    public static String getAccessToken(){
        HttpRequest request = new HttpRequest();
        SAVI__mdt saviAuthRequestSettings = getAuthRequestSettings();
        String endPoint = String.format('{0}{1}', new string[]{saviAuthRequestSettings.BaseURL__c, saviAuthRequestSettings.Endpoint__c});
        String authorization = String.format('{0}:{1}', new string[]{saviAuthRequestSettings.ClientId__c,saviAuthRequestSettings.ClientSecret__c});
        String authHeader = String.format('{0} {1}',new string[]{saviAuthRequestSettings.AuthType__c,EncodingUtil.base64Encode(Blob.valueOf(authorization))});

        request.setEndpoint(endPoint);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', authHeader);
        request.setBody('grant_type=client_credentials');
        request.setMethod(saviAuthRequestSettings.Method__c);

        Http http = new Http();
        HttpResponse response = http.send(request);
        System.debug('response:::'+response);

        string responseStatusCode = String.valueof(response.getStatusCode()); 
        string responseBody = String.valueof(response.getbody());
        Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(responseBody);
        return (responseStatusCode == '200') ? (String)results.get('access_token')  : null;
    }
}
