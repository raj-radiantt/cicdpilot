/***********************************************************************************************************
Class Name: SAVIContentDownloadHandlerFactoryImpl Version: 1.0
Purpose: This class implements the Sfc.ContentDownloadHandlerFactory interface and returns a download handler 
that blocks downloading content when SAVI_File_Scan_Status__c is not equal to 'Clean'.
By: Subha Janarthanan(subha@radiantt.com)
************************************************************************************************************/
public with sharing class SAVIContentDownloadHandlerFactoryImpl  implements sfc.ContentDownloadHandlerFactory{
    
    public Sfc.ContentDownloadHandler getContentDownloadHandler(List<Id> ids, sfc.ContentDownloadContext context) 
    {
     Sfc.ContentDownloadHandler contentDownloadHandler = new Sfc.ContentDownloadHandler();
     system.debug('context::'+context);
     try
     {   
     boolean isDownloadable = true;
     id firstIdNotDownloadable = null;

     Id profileId=userinfo.getProfileId();
     String userProfileName = [Select Id,Name from Profile where Id=:profileId].Id;
     String profileName=[Select Id,Name from Profile where Name='API Only'].Id;
     system.debug('Profile check::'+ userProfileName != profileName);
    if(userProfileName != profileName) { // Check added to allow the API User to download the file for scanning
     for(contentVersion cv:[select id, Title, SAVI_File_Scan_Status__c, CreatedDate from contentversion where id in :ids])
     {
      system.debug('Download Handler:' + cv.SAVI_File_Scan_Status__c);
      if(cv.SAVI_File_Scan_Status__c!='Clean') // Check to block download
      {   
       system.debug('cv Log:' + cv);   
       firstIdNotDownloadable = cv.id;   
       isDownloadable = false; 
      }        
     }   
    }        
     if(isDownloadable) 
     {
      contentDownloadHandler.isDownloadAllowed = true;
      return contentDownloadHandler;
     }    
     else
     {
      contentDownloadHandler.isDownloadAllowed = false;
      contentDownloadHandler.downloadErrorMessage = 'This file needs to be scanned. You\'re not allowed to download it';
      return contentDownloadHandler;
     }
     }
     catch(System.Exception Ex)
     {
      System.debug('Log 1 :' + Ex.getMessage());        
     }
     return contentDownloadHandler;        
    } 

}