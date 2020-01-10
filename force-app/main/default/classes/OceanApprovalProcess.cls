public class OceanApprovalProcess {

    public void CRMTAdminReview(List<Ocean_Request__c> newRequest , List<Ocean_Request__c> oldRequest){
        // Query the collaboration group to send notifications
        CollaborationGroup  cgCRMS = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resource Management Support Team'];
        CollaborationGroup  cgCRMT = [SELECT Id,Name FROM CollaborationGroup WHERE Name = 'Cloud Resource Management Team'];
 
        for (Integer i = 0; i < newRequest.size(); i++) {
            // COR/GTL Approval 
            if(newRequest[i].CRMT_Request_Status__c == 'COR/GTL Approval' && oldRequest[i].CRMT_Request_Status__c != 'COR/GTL Approval') {
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+' has been submitted and is pending COR/GTL approval.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }


            // Intake Review // 
            if(newRequest[i].CRMT_Request_Status__c == 'CRMT Intake Review' && oldRequest[i].CRMT_Request_Status__c != 'CRMT Intake Review') {
                submitForIntakeReview(newRequest[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+' has been approved by the COR/GTL and is ready for review.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
            if(newRequest[i].CRMT_Request_Status__c == 'CRMT Intake Leadership Review' && oldRequest[i].CRMT_Request_Status__c != 'CRMT Intake Leadership Review') {
                approveIntakeReview(newRequest[i]);               
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body = 'The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+' is ready for CRMT Intake Leadership Review.';
                feedToCG.ParentId = cgCRMT.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
            if(newRequest[i].CRMT_Request_Status__c == 'CRMT Intake Review Complete' && oldRequest[i].CRMT_Request_Status__c != 'CRMT Intake Review Complete') {
                approveIntakeReview(newRequest[i]);
            }
            if(newRequest[i].CRMT_Request_Status__c == 'Draft' && oldRequest[i].CRMT_Request_Status__c == 'CRMT Intake Review') {
                rejectIntakeReview(newRequest[i]);
            } 
             if(newRequest[i].CRMT_Request_Status__c == 'Draft' && oldRequest[i].CRMT_Request_Status__c == 'CRMT Intake Leadership Review') {
                rejectIntakeReview(newRequest[i]);
            } 

            // ROM Review //
            if(newRequest[i].CRMT_Request_Status__c == 'Initial ROM Review' && oldRequest[i].CRMT_Request_Status__c != 'Initial ROM Review') {
                submitForIntakeReview(newRequest[i]);              
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body = 'The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+' is ready for Initial ROM Review.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
            if(newRequest[i].CRMT_Request_Status__c == 'ROM Leadership Review' && oldRequest[i].CRMT_Request_Status__c != 'ROM Leadership Review') {
                approveIntakeReview(newRequest[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+' is ready for ROM Leadership Review.';
                feedToCG.ParentId = cgCRMT.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
            if(newRequest[i].CRMT_Request_Status__c == 'ROM Reviewed' && oldRequest[i].CRMT_Request_Status__c != 'ROM Reviewed') {
                approveIntakeReview(newRequest[i]);
            }
            if(newRequest[i].CRMT_Request_Status__c == 'ROM Requested' && oldRequest[i].CRMT_Request_Status__c == 'Initial ROM Review') {
                rejectIntakeReview(newRequest[i]);
            } 

            // RFP Review //
            if(newRequest[i].CRMT_Request_Status__c == 'Initial RFP Review' && oldRequest[i].CRMT_Request_Status__c != 'Initial RFP Review' ) {
                submitForIntakeReview(newRequest[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+'  is ready for Initial RFP Review.';
                feedToCG.ParentId = cgCRMS.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
            if(newRequest[i].CRMT_Request_Status__c == 'RFP Leadership Review' && oldRequest[i].CRMT_Request_Status__c != 'RFP Leadership Review') {
                approveIntakeReview(newRequest[i]);
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+'  is ready for RFP Leadership Review.';
                feedToCG.ParentId = cgCRMT.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
            if(newRequest[i].CRMT_Request_Status__c == 'RFP Reviewed' && oldRequest[i].CRMT_Request_Status__c != 'RFP Reviewed') {
                approveIntakeReview(newRequest[i]);
            }
            if(newRequest[i].CRMT_Request_Status__c == 'RFP Requested' && oldRequest[i].CRMT_Request_Status__c == 'Initial RFP Review') {
                rejectIntakeReview(newRequest[i]);
            } 

            // Review Complete
            if(newRequest[i].CRMT_Request_Status__c == 'Request Complete' && oldRequest[i].CRMT_Request_Status__c != 'Request Complete') {
                FeedItem feedToCG = new FeedItem();
                feedToCG.Body ='The '+newRequest[i].Application_Name__c+' Cloud Resource Request for '+newRequest[i].CurrentWave__c+' is now complete.';
                feedToCG.ParentId = cgCRMT.Id;
                feedToCG.Type ='TextPost';
                feedToCG.Visibility = 'AllUsers';
                feedToCG.NetworkScope = '0DBr000000006vXGAQ';
                insert feedToCG;
            }
        }
    }

    public void feedItemOwner(FeedItem fi, string feedId){
        FeedItem newFi = [SELECT Id,ParentId,body FROM FeedItem WHERE Id =: fi.id];
        newFi.ParentId = feedId;
        update newFi;
    }

	public void submitForIntakeReview(Ocean_Request__c oceanReq) {
        Group CRMSQueue = [SELECT Id FROM Group WHERE Type = 'Queue' AND NAME = 'CRMS'];
        Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
        req1.setComments(oceanReq.Approval_Comments__c);
     //   oceanReq.Approval_Comments__c  = '';
        req1.setObjectId(oceanReq.id);
        req1.setNextApproverIds(new Id[] {CRMSQueue.id});
        // Submit the approval request for the Ocean Request
        Approval.ProcessResult result = Approval.process(req1);
    }

    
    /*** Get ProcessInstanceWorkItemId using SOQL ***/
    public Id getWorkItemId(Id targetObjectId)
    {
        Id retVal = null;
        for(ProcessInstanceWorkitem workItem  : [Select p.Id from ProcessInstanceWorkitem p
            where p.ProcessInstance.TargetObjectId =: targetObjectId])
        {
            retVal  =  workItem.Id;
        }

        return retVal;
    }
    
    /** This method will Approve the OceanRequest **/
    public void approveIntakeReview(Ocean_Request__c oceanReq) {
        Group CRMTQueue = [SELECT Id FROM Group WHERE Type = 'Queue' AND NAME = 'CRMT'];
        Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
        req.setComments(oceanReq.Approval_Comments__c);
    //    oceanReq.Approval_Comments__c  = '';
        req.setAction('Approve');
        req.setNextApproverIds(new Id[] {CRMTQueue.Id});
        Id workItemId = getWorkItemId(oceanReq.id); 

        if(workItemId == null)
        {
            oceanReq.addError('Error Occured in Approval');
        }
        else
        {
            req.setWorkitemId(workItemId);
            Approval.ProcessResult result =  Approval.process(req);
        }
    }

    /*** This method will Reject the Ocean Request ***/
    public void rejectIntakeReview(Ocean_Request__c oceanReq)
    {
        Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
        req.setComments(oceanReq.Approval_Comments__c);
     //   oceanReq.Approval_Comments__c  = '';
        req.setAction('Reject');
        Id workItemId = getWorkItemId(oceanReq.id);   

        if(workItemId == null)
        {
            oceanReq.addError('Error Occured in Trigger');
        }
        else
        {
            req.setWorkitemId(workItemId);
            Approval.ProcessResult result =  Approval.process(req);
        }
    }
}