public with sharing class SAVIAuth {

    private static SAVI__mdt getAuthRequestSettings(){
        SAVI__mdt authRequestSettings = [SELECT DeveloperName,MasterLabel,BaseURL__c,Endpoint__c,AuthType__c,ClientId__c,ClientSecret__c,Method__c FROM SAVI__mdt WHERE MasterLabel= 'AuthRequest'];
        return authRequestSettings;
    }

    @Future(Callout = true)
    public static void getAccessToken(){
        HttpRequest request = new HttpRequest();
        SAVI__mdt saviAuthRequestSettings = getAuthRequestSettings();
        String endPoint = String.format('{0}{1}', new string[]{saviAuthRequestSettings.BaseURL__c, saviAuthRequestSettings.Endpoint__c});
        String authorization = String.format('{0}:{1}', new string[]{saviAuthRequestSettings.ClientId__c,saviAuthRequestSettings.ClientSecret__c});
        String authHeader = String.format('{0} {1}',new string[]{'Basic',EncodingUtil.base64Encode(Blob.valueOf(authorization))});

        request.setEndpoint(endPoint);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', authHeader);
        request.setBody('grant_type=client_credentials');

        Http http = new Http();
        HttpResponse response = http.send(request);
        System.debug('response:::'+response);
    }
}