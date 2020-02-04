trigger AVContentVersionTrigger on ContentVersion (before insert, after insert, before update) {
    if(trigger.IsInsert && trigger.isAfter) {
        System.debug('Inside AVContentVersionTrigger: 1' );
       
            Integer allowedJobs = Limits.getLimitQueueableJobs();
            Integer i = 0;
            
        for(ContentVersion cv : trigger.New) {
            System.debug('Inside AVContentVersionTrigger For Loop: 2 ' + 'Before AVCOFileSubmissionQueue Execute' );
            if(i++ == allowedJobs)
                break;
     
                SAVIFileScan.getFileScanResults(cv.Id);
                System.debug('Inside AVContentVersionTrigger Execute Successful: 3');
            }
        }
}