public class AVCOFileSubmissionQueue implements Queueable,Database.AllowsCallouts{
    public static final String restEndpoint = 'http://18.220.53.190:8081/api/v1/scanfile?contentVersionID=';
    public static final Map<String, String> headerMap = new Map<String, String>{'Content-Type' => 'application/json'};
    private ContentVersion cv {get; set;}
    public HTTPResponse res;

    public AVCOFileSubmissionQueue(Id cvId) {
        this.cv = [SELECT Id,FileExtension,Title,ContentDocumentId,SAVI_File_Scan_Status__c,SAVI_Scan_Status_Log__c from ContentVersion WHERE Id=:cvId];
    }

    public void execute(System.QueueableContext qc) {

        system.debug('Inside AVCOFileSubmissionQueue:');
        String callbackURL = 'https://ocean1--oceandsg1.my.salesforce.com' + '/services/callBackResponse';
        try {      
            // JSONGenerator jsonGen = JSON.createGenerator(true);    
            // jsonGen.writeStartObject();      
            
            // jsonGen.writeStringField('fileId', cv.Id);
            // jsonGen.writeStringField('callbackurl',callbackURL);
            // jsonGen.writeEndObject(); 
            
            HttpRequest request = new HttpRequest();

            request.setEndpoint(restEndpoint+cv.Id);
    
            for (String s : headerMap.keySet()) {
                request.setHeader(s, headerMap.get(s));
            }
    
            // request.setBody(jsonGen.getAsString());
            request.setMethod('Post');
            
            //HttpRequest req = HttpCalloutHelper.buildHttpRequestWithHeader(jsonGen.getAsString(),headerMap,muleSoftEndpoint,AV_Constants.POST_METHOD,120000);
            if((test.isRunningTest()==false))
             {
              Http http = new Http();
                HttpResponse response; 
                if(!Test.isRunningTest())
                    response = http.send(request);
                else {
                    response = new HTTPResponse();
                    response.setStatusCode(200);
                }
               //res = HttpCalloutHelper.sendRequest(req);
             }
    
            system.debug('Inside AVCOFileSubmissionQueue - RestEd point: :' + restEndpoint+cv.Id);
            string responseStatusCode = String.valueof(res.getStatusCode()); 
            string responseBody = String.valueof(res.getbody());
            Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(responseBody);
            
            
            System.debug('responseStatusCode:'+responseStatusCode+' responseBody:'+responseBody);
            boolean validToLog = true;
             if(responseStatusCode!=null && responseStatusCode == '200')
             {             
              validToLog = true;
              cv.SAVI_File_Scan_Status__c= 'In Progress';
              cv.SAVI_Scan_Status_Log__c = cmsSEIGenerateScanLog('In Progress', responseStatusCode, responseBody) + cv.SAVI_Scan_Status_Log__c;
             }
             else 
             {
                     validToLog = false;
             } 
             database.update(cv,false);
         
      }catch(Exception e) {
        system.debug('Exception:'+e);
        database.update(cv,false);  
      }
  } 

    public static String cmsSEIGenerateScanLog(String status, String responseStatusCode, String responseBody) {
        return '|Status: ' + status + '| DateTime: ' + system.Datetime.now().format() + ' | Response Code:' + responseStatusCode + '| Response Body: ' + responseBody + '|\n';
    }

}