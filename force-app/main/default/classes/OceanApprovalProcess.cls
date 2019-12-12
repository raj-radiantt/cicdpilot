public class OceanApprovalProcess {
	public void submitForIntakeReview(Ocean_Request__c oceanReq) {
        Group CRMSQueue = [SELECT Id FROM Group WHERE Type = 'Queue' AND NAME = 'CRMS'];
        Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
        req1.setComments('Submitting request for approval automatically using Trigger');
        req1.setObjectId(oceanReq.id);
        req1.setNextApproverIds(new Id[] {CRMSQueue.id});
        // Submit the approval request for the Ocean Request
        Approval.ProcessResult result = Approval.process(req1);
    }

    public void CRMSSubmitForApproval(Ocean_Request__c oceanReq) {
        Group CRMTQueue = [SELECT Id FROM Group WHERE Type = 'Queue' AND NAME = 'CRMT'];
        Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
        req1.setComments('Submitting request for approval automatically using Trigger');
        req1.setObjectId(oceanReq.id);
        req1.setNextApproverIds(new Id[] {CRMTQueue.id});
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
        req.setComments('Approving request using Trigger');
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
        req.setComments('Rejected request using Trigger');
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