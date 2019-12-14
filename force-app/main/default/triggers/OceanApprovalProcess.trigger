trigger OceanApprovalProcess on Ocean_Request__c (After Update) {
    OceanApprovalProcess handler = new OceanApprovalProcess();
    if(Trigger.isAfter && Trigger.isUpdate){
        // Update all the child AWS resources status to 'Under Review' //
    /*    for(Ocean_Request__c oc : Trigger.New) {
            updateEC2ResourceStatus(oc);
            updateEBSResourceStatus(oc);
            updateEFSResourceStatus(oc);
            updateELBResourceStatus(oc);
            updateEMRResourceStatus(oc);
            updateLambdaResourceStatus(oc);
            updateQsightResourceStatus(oc);
            updateRDSResourceStatus(oc);
            updateRDSBkupResourceStatus(oc);
            updateDynamoResourceStatus(oc);
            updateS3ResourceStatus(oc);
            updateVPCResourceStatus(oc);
            updateRSResourceStatus(oc);
            updateWSResourceStatus(oc);
            updateDTResourceStatus(oc);
            updateOtherResourceStatus(oc);
        } */
        for (Integer i = 0; i < Trigger.New.size(); i++) {
            // Intake Review // 
            if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Intake Review' && Trigger.old[i].CRMT_Request_Status__c != 'CRMT Intake Review') {
                handler.submitForIntakeReview(Trigger.new[i]);
                CollaborationGroup  cg = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resources Management Support Team'];
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='@['+cg.Name+'] '+Trigger.New[i].Application_Name__c+' '+' Cloud Resource Request for'+' '+Trigger.New[i].CurrentWave__c+' '+'is ready for Intake Review';
                feedToCG.ParentId = cg.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Intake Leadership Review' && Trigger.old[i].CRMT_Request_Status__c != 'CRMT Intake Leadership Review') {
                handler.approveIntakeReview(Trigger.new[i]);
                CollaborationGroup  cg = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resource Management Team'];
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='@['+cg.Name+'] '+Trigger.New[i].Application_Name__c+' '+' Cloud Resource Request for'+' '+Trigger.New[i].CurrentWave__c+' '+'is ready for CRMT Intake Leadership Review';
                feedToCG.ParentId = cg.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Intake Review Complete' && Trigger.old[i].CRMT_Request_Status__c != 'CRMT Intake Review Complete') {
                handler.approveIntakeReview(Trigger.new[i]);
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'Draft' && Trigger.old[i].CRMT_Request_Status__c == 'CRMT Intake Review') {
                handler.rejectIntakeReview(Trigger.new[i]);
            } 
             if(Trigger.New[i].CRMT_Request_Status__c == 'Draft' && Trigger.old[i].CRMT_Request_Status__c == 'CRMT Intake Leadership Review') {
                handler.rejectIntakeReview(Trigger.new[i]);
            } 

            // ROM Review //
            if(Trigger.New[i].CRMT_Request_Status__c == 'Initial ROM Review' && Trigger.old[i].CRMT_Request_Status__c != 'Initial ROM Review' && Trigger.New[i].ROM_Received__c == TRUE) {
                handler.submitForIntakeReview(Trigger.new[i]);
                CollaborationGroup  cg = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resources Management Support Team'];
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='@['+cg.Name+'] '+Trigger.New[i].Application_Name__c+' '+' Cloud Resource Request for'+' '+Trigger.New[i].CurrentWave__c+' '+'is ready for Initial ROM Review';
                feedToCG.ParentId = cg.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'ROM Leadership Review' && Trigger.old[i].CRMT_Request_Status__c != 'ROM Leadership Review') {
                handler.approveIntakeReview(Trigger.new[i]);
                CollaborationGroup  cg = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resource Management Team'];
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='@['+cg.Name+'] '+Trigger.New[i].Application_Name__c+' '+' Cloud Resource Request for'+' '+Trigger.New[i].CurrentWave__c+' '+'is ready for ROM Leadership Review';
                feedToCG.ParentId = cg.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'ROM Reviewed' && Trigger.old[i].CRMT_Request_Status__c != 'ROM Reviewed') {
                handler.approveIntakeReview(Trigger.new[i]);
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'ROM Requested' && Trigger.old[i].CRMT_Request_Status__c == 'Initial ROM Review') {
                handler.rejectIntakeReview(Trigger.new[i]);
            } 

            // RFP Review //
            if(Trigger.New[i].CRMT_Request_Status__c == 'Initial RFP Review' && Trigger.old[i].CRMT_Request_Status__c != 'Initial RFP Review' && Trigger.New[i].RFP_Recieved__c == TRUE) {
                handler.submitForIntakeReview(Trigger.new[i]);
                CollaborationGroup cg = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resources Management Support Team'];
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='@['+cg.Name+'] '+Trigger.New[i].Application_Name__c+' '+' Cloud Resource Request for'+' '+Trigger.New[i].CurrentWave__c+' '+'is ready for Initial RFP Review';
                feedToCG.ParentId = cg.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'RFP Leadership Review' && Trigger.old[i].CRMT_Request_Status__c != 'RFP Leadership Review') {
                handler.approveIntakeReview(Trigger.new[i]);
                CollaborationGroup  cg = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resource Management Team'];
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='@['+cg.Name+'] '+Trigger.New[i].Application_Name__c+' '+' Cloud Resource Request for'+' '+Trigger.New[i].CurrentWave__c+' '+'is ready for RFP Leadership Review';
                feedToCG.ParentId = cg.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'RFP Reviewed' && Trigger.old[i].CRMT_Request_Status__c != 'RFP Reviewed') {
                handler.approveIntakeReview(Trigger.new[i]);
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'RFP Requested' && Trigger.old[i].CRMT_Request_Status__c == 'Initial RFP Review') {
                handler.rejectIntakeReview(Trigger.new[i]);
            } 
        }
    }
}
