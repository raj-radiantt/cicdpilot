trigger OceanApprovalProcess on Ocean_Request__c (After Update) {
    OceanApprovalProcess handler = new OceanApprovalProcess();
    OceanUpdateResourceStatus updateHandler = new OceanUpdateResourceStatus();
    if(Trigger.isAfter && Trigger.isUpdate){
        // Update all the child AWS resources status to 'Under Review' & 'Approved' //
        for(Ocean_Request__c oc : Trigger.New) {
            updateHandler.updateEC2ResourceStatus(oc);
            updateHandler.updateEBSResourceStatus(oc);
            updateHandler.updateEFSResourceStatus(oc);
            updateHandler.updateELBResourceStatus(oc);
            updateHandler.updateEMRResourceStatus(oc);
            updateHandler.updateLambdaResourceStatus(oc);
            updateHandler.updateQsightResourceStatus(oc);
            updateHandler.updateRDSResourceStatus(oc);
            updateHandler.updateRDSBkupResourceStatus(oc);
            updateHandler.updateDynamoResourceStatus(oc);
            updateHandler.updateS3ResourceStatus(oc);
            updateHandler.updateVPCResourceStatus(oc);
            updateHandler.updateRSResourceStatus(oc);
            updateHandler.updateWSResourceStatus(oc);
            updateHandler.updateDTResourceStatus(oc);
            updateHandler.updateOtherResourceStatus(oc);
        } 

        // Query the collaboration group to send notifications
        CollaborationGroup  cgCRMS = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resources Management Support Team'];
        CollaborationGroup  cgCRMT = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resources Management Team'];
 
        for (Integer i = 0; i < Trigger.New.size(); i++) {
            // COR/GTL Approval 
            if(Trigger.New[i].CRMT_Request_Status__c == 'COR/GTL Approval' && Trigger.old[i].CRMT_Request_Status__c != 'COR/GTL Approval') {
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+' has been submitted and is pending COR/GTL approval.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            // Intake Review // 
            if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Intake Review' && Trigger.old[i].CRMT_Request_Status__c != 'CRMT Intake Review') {
                handler.submitForIntakeReview(Trigger.new[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+' has been approved by the COR/GTL and is ready for review.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Intake Leadership Review' && Trigger.old[i].CRMT_Request_Status__c != 'CRMT Intake Leadership Review') {
                handler.approveIntakeReview(Trigger.new[i]);               
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body = '['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+' is ready for CRMT Intake Leadership Review.';
                feedToCG.ParentId = cgCRMT.Id;
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
            if(Trigger.New[i].CRMT_Request_Status__c == 'Initial ROM Review' && Trigger.old[i].CRMT_Request_Status__c != 'Initial ROM Review') {
                handler.submitForIntakeReview(Trigger.new[i]);              
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body = '['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+' is ready for Initial ROM Review.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'ROM Leadership Review' && Trigger.old[i].CRMT_Request_Status__c != 'ROM Leadership Review') {
                handler.approveIntakeReview(Trigger.new[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+' is ready for ROM Leadership Review.';
                feedToCG.ParentId = cgCRMT.Id;
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
            if(Trigger.New[i].CRMT_Request_Status__c == 'Initial RFP Review' && Trigger.old[i].CRMT_Request_Status__c != 'Initial RFP Review' ) {
                handler.submitForIntakeReview(Trigger.new[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+'  is ready for Initial RFP Review.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'RFP Leadership Review' && Trigger.old[i].CRMT_Request_Status__c != 'RFP Leadership Review') {
                handler.approveIntakeReview(Trigger.new[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+'  is ready for RFP Leadership Review.';
                feedToCG.ParentId = cgCRMT.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'RFP Reviewed' && Trigger.old[i].CRMT_Request_Status__c != 'RFP Reviewed') {
                handler.approveIntakeReview(Trigger.new[i]);
            }
            if(Trigger.New[i].CRMT_Request_Status__c == 'RFP Requested' && Trigger.old[i].CRMT_Request_Status__c == 'Initial RFP Review') {
                handler.rejectIntakeReview(Trigger.new[i]);
            } 

            // Review Complete
            if(Trigger.New[i].CRMT_Request_Status__c == 'Request Complete' && Trigger.old[i].CRMT_Request_Status__c != 'Request Complete') {
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='['+Trigger.New[i].Application_Name__c+'] Cloud Resource Request for '+Trigger.New[i].CurrentWave__c+' is now complete.';
                feedToCG.ParentId = cgCRMT.Id;
                feedToCG.Type ='TextPost';
                insert feedToCG;
            }
        }
    }
}
