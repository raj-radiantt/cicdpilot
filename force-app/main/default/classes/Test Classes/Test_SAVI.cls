/***********************************************************************************************************
Class Name: Test_SAVI Version: 1.0
Purpose: This is the test class for the SAVI Antivirus package.
By: Subha Janarthanan(subha@radiantt.com)
************************************************************************************************************/
@isTest
public with sharing class Test_SAVI {
    // Positive test to get the scan result as "Clean"
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
        cv.SAVI_Scan_Status_Log__c = 'File sent for scanning';
        insert cv;
        List<Id> idList = new List<Id>();
        idList.add(cv.id);
        Set<Id> idSet = new Set<Id>();
        idSet.addAll(idList);
        
        sfc.ContentDownloadContext context;
        SAVIContentDownloadHandlerFactoryImpl downloadHandler = new SAVIContentDownloadHandlerFactoryImpl();
        downloadHandler.getContentDownloadHandler(idList,context);
        SAVIRequestMock fakeResponse = new SAVIRequestMock(200,
                                                                   'Complete',
                                                                   '{"Name": "sForceTest1"}',
                                                                   null);
        Test.setMock(HttpCalloutMock.class, fakeResponse);      
        AVCallbackResponse.saviCallbackResponse();
        SAVIFileScan.getFileScanResults(idSet);
        SAVIFileScan.getFileScanSettings();
        system.assert(cv.SAVI_File_Scan_Status__c == 'Clean','Clean');
        test.stopTest();
    }
     // Negative test to get the scan result as "Not Clean"
    public static testMethod void saviTestNegative() {
        test.startTest();
        Case cs = new Case();
        insert cs;
        contentversion cv = new contentversion();
        cv.Title = 'Test';
        cv.PathOnClient = 'Test.txt';
        cv.FirstPublishLocationId = cs.Id;
        cv.VersionData = EncodingUtil.base64Decode('Test');
        cv.IsMajorVersion = true;
        cv.SAVI_File_Scan_Status__c = 'Not Clean';
        cv.SAVI_Scan_Status_Log__c = 'File could not be sent for scanning';
        insert cv;
        List<Id> idList = new List<Id>();
        idList.add(cv.id);
        Set<Id> idSet = new Set<Id>();
        idSet.addAll(idList);
        
        sfc.ContentDownloadContext context;
        SAVIContentDownloadHandlerFactoryImpl downloadHandler = new SAVIContentDownloadHandlerFactoryImpl();
        downloadHandler.getContentDownloadHandler(idList,context);
        SAVIRequestMock fakeResponse = new SAVIRequestMock(200,
                                                                   'Complete',
                                                                   '{"Name": "sForceTest1"}',
                                                                   null);
        Test.setMock(HttpCalloutMock.class, fakeResponse);      
        AVCallbackResponse.saviCallbackResponse();
        SAVIFileScan.getFileScanResults(idSet);
        SAVIFileScan.getFileScanSettings();
        system.assert(cv.SAVI_File_Scan_Status__c == 'Not Clean','Not Clean');
        test.stopTest();
    }
}
