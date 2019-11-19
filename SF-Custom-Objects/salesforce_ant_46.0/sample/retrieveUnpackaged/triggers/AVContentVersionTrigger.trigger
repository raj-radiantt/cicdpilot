trigger AVContentVersionTrigger on ContentVersion (before insert, after insert, before update) {
    if(trigger.IsInsert) {
        if(trigger.isAfter) {
            Integer allowedJobs = Limits.getLimitQueueableJobs();
            Integer i = 0;
            
        for(ContentVersion cv : trigger.New) {
            if(i++ == allowedJobs)
                break;
            // System.enqueueJob(new AVCOFileSubmissionQueue(cv.Id));
            AVCOFileSubmissionQueue.execute(cv.Id);
        }
        }
    }
}