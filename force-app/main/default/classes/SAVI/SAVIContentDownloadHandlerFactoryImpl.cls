public class SAVIContentDownloadHandlerFactoryImpl  implements sfc.ContentDownloadHandlerFactory{
    
    public Sfc.ContentDownloadHandler getContentDownloadHandler(List<Id> Ids, sfc.ContentDownloadContext context) 
    {
     Sfc.ContentDownloadHandler contentDownloadHandler = new Sfc.ContentDownloadHandler();
     try
     {   
     boolean isDownloadable = true;
     id firstIdNotDownloadable = null;
     for(contentVersion cv:[select id, Title, SAVI_File_Scan_Status__c, CreatedDate from contentversion where id in :Ids])
     {
      system.debug('Download Handler:' + cv.SAVI_File_Scan_Status__c);
      if(cv.SAVI_File_Scan_Status__c!='Clean') 
      {   
       system.debug('cv Log:' + cv);   
       firstIdNotDownloadable = cv.id;   
       isDownloadable = false; 
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
    //  contentDownloadHandler.redirectUrl ='' + firstIdNotDownloadable;
     }
     }
     catch(System.Exception Ex)
     {
      System.debug('Log 1 :' + Ex.getMessage());        
     }
     return contentDownloadHandler;        
    } 

}