public class AVCOFileSubmissionQueue {
    
   // public static final String restEndpoint = 'http://3.85.33.53:8081/api/v1/scanfile?contentVersionID=';
    public static final String restEndpoint = 'https://impl.savi.ocean.cms.gov/api/v1/savi/auth/token';
    public static final Map<String, String> headerMap=new Map<String,String>{'Content-Type'=>'application/json'};

    @Future(Callout = true)
    public static void execute(Id cvId) {
     ContentVersion cv = [SELECT Id,FileExtension,Title,ContentDocumentId,SAVI_File_Scan_Status__c,SAVI_Scan_Status_Log__c from ContentVersion WHERE Id=:cvId];
         HTTPResponse res;
         HttpResponse response; 
        System.debug('Inside AVCOFileSubmissionQueue:');
        String callbackURL = 'https://ocean1--oceandsg1.my.salesforce.com' + '/services/callBackResponse';
        try {   
            HttpRequest request = new HttpRequest();
            request.setEndpoint(restEndpoint+cv.Id);
            for (String s : headerMap.keySet()) {
                request.setHeader(s, headerMap.get(s));
            }
            request.setMethod('POST');
            Http http = new Http();
            response = http.send(request);
            System.debug('##-- Inside AVCOFileSubmissionQueue - RestEnd point: :' + restEndpoint+cv.Id);
            string responseStatusCode = String.valueof(response.getStatusCode()); 
            string responseBody = String.valueof(response.getbody());
            Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(responseBody);
            System.debug('##-- responseStatusCode:'+responseStatusCode+' responseBody:'+responseBody);
            boolean validToLog = true;
            if(responseStatusCode!=null && responseStatusCode == '200') {    
              Datetime dt = (DateTime)JSON.deserialize('"' +  results.get('lastScanDate') + '"', DateTime.class);         
              // cv.SAVI_Scan_Date__c= (Date) date.parse((string) results.get('lastScanDate'));
              cv.SAVI_Scan_Date__c = dt;
              cv.SAVI_File_Scan_Status__c = (String)results.get('scanStatus');
              update cv;  
            }
      }catch(Exception e) {
        system.debug('Exception:'+e);
      }
  }
}