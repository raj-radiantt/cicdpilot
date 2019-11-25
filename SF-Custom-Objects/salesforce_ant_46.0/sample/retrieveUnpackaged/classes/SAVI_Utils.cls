public class SAVI_Utils {
    
     //Receives ContentVersionID ( of File under consideration ) as a Parameter and sends it to SAVI AWS Service
    @Future(callout = true)
    public static void CallSaviService(string contentVersionID) {
        
        string SAVI_BASE_URL = 'http://18.220.53.190:8081';
        
        string fileValidate_Route = '/api/v1/scanfile?contentVersionID=';
        
        HttpRequest saviRequest = new HttpRequest();
        saviRequest.setEndpoint(SAVI_BASE_URL + fileValidate_Route + contentVersionID);
        saviRequest.setMethod('POST');
        
        Http http = new Http();
        HttpResponse saviResponse = http.send(saviRequest);
        System.debug('$$$$$$$$$ Response From Service: ' + saviResponse.getBody());   
        
    }

}