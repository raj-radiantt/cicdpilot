trigger AVContentVersionTrigger on ContentVersion (before insert, after insert, before update) {
    if(trigger.IsInsert) {
        System.debug('Inside AVContentVersionTrigger: 1' );
        if(trigger.isAfter) {
            Integer allowedJobs = Limits.getLimitQueueableJobs();
            Integer i = 0;
            
        for(ContentVersion cv : trigger.New) {
            System.debug('Inside AVContentVersionTrigger For Loop: 2 ' + 'Before AVCOFileSubmissionQueue Execute' );
            if(i++ == allowedJobs)
                break;
            // System.enqueueJob(new AVCOFileSubmissionQueue(cv.Id));
            AVCOFileSubmissionQueue.execute(cv.Id);
            System.debug('Inside AVContentVersionTrigger Execute Successful: 3');
        }
        }
    }
}