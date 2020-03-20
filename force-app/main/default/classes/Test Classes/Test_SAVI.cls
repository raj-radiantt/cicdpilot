@isTest
public with sharing class Test_SAVI {
    public static testMethod void saviTest() {
        test.startTest();
        Case cs = new Case();
        insert cs;

        contentversion cv = new contentversion();
        cv.Title = 'Test';
        cv.PathOnClient = 'Test.txt';
        cv.FirstPublishLocationId = cs.Id;
        cv.VersionData = EncodingUtil.base64Decode('Test');
        cv.IsMajorVersion = true;
        cv.SAVI_File_Scan_Status__c = 'Clean';
        insert cv;

        contentversion cv1 = new contentversion();
        cv1.Title = 'Test';
        cv1.PathOnClient = 'Test.txt';
        cv1.FirstPublishLocationId = cs.Id;
        cv1.VersionData = EncodingUtil.base64Decode('Test');
        cv1.IsMajorVersion = true;
        cv1.SAVI_File_Scan_Status__c = '';
        insert cv1;

        FileUploadWrapper fileWrapper = new FileUploadWrapper();
        fileWrapper.id = cv.Id;
        fileWrapper.url = '/sfc/servlet.shepherd/document/download/'+cv.ContentDocumentId;
        fileWrapper.title = cv.Title;
        fileWrapper.contentDocumentId = cv.ContentDocumentId;
        fileWrapper.scanStatus = cv.SAVI_File_Scan_Status__c;
        List<Id> idList = new List<Id>();
        idList.add(cv.id);
        List<Id> idList1 = new List<Id>();
        idList1.add(cv1.id);
        
        sfc.ContentDownloadContext context;
        SAVIContentDownloadHandlerFactoryImpl downloadHandler = new SAVIContentDownloadHandlerFactoryImpl();
        downloadHandler.getContentDownloadHandler(idList,context);
        downloadHandler.getContentDownloadHandler(idList1,context);
        SAVIRequestMock fakeResponse = new SAVIRequestMock(200,
                                                                   'Complete',
                                                                   '{"Name": "sForceTest1"}',
                                                                   null);
        Test.setMock(HttpCalloutMock.class, fakeResponse);      

        AVCallbackResponse.saviCallbackResponse();
        string accessToken = 'testaccesstoken';
        // SAVIAuth.getAccessToken();
        SAVIFileScan.getFileScanResults(cv.id);
        SAVIFileScan.getFileScanSettings();
        SAVIFileScan.fileScanLog(cv.id, 'File sent for scanning');
        test.stopTest();
    }
}
