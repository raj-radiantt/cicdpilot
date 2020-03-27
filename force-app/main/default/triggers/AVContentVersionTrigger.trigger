trigger AVContentVersionTrigger on ContentVersion (after insert) {
    List<Id> cvIdList = new List<Id>();    
    for(ContentVersion cv : Trigger.New){
        cvIdList.add(cv.Id);
    }
        SAVIFileScan.getFileScanResults(cvIdList);
         //   Integer allowedJobs = Limits.getLimitQueueableJobs();
         //   Integer i = 0;
            
        //for(ContentVersion cv : trigger.New) {
        //    if(i++ == allowedJobs)
        //        break;    
}