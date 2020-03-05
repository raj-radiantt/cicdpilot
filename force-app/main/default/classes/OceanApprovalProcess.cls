public with sharing class OceanApprovalProcess {

	public void crmtAdminReview(Map<Id, Ocean_Request__c> newRequest, Map<Id, Ocean_Request__c> oldRequest) {
		// Query the collaboration group to send notifications
		List<FeedItem> feedItemList = new List<FeedItem>();
		Network myNetwork = [SELECT Id, name FROM Network WHERE Name = 'ocean-crm' WITH SECURITY_ENFORCED LIMIT 1];
        final String MYNETWORKID = myNetwork.id;
		List<CollaborationGroup> cg = new List<CollaborationGroup>();
		cg = [SELECT Id, Name FROM CollaborationGroup WHERE Name IN('Cloud Resource Management Support Team', 'Cloud Resource Management Team') WITH SECURITY_ENFORCED];
		final String CRMS_GROUP = cg [0].id;
		final String CRMT_GROUP = cg [1].id;

		for(Ocean_Request__c req :newRequest.values()) {
			// COR/GTL Approval
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'COR/GTL Approval' && oldRequest.get(req.id).CRMT_Request_Status__c != 'COR/GTL Approval') {
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + ' has been submitted and is pending COR/GTL approval.';
                FeedItem feedToCG = createFeedItem(CRMS_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}

			// Intake Review //
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'CRMT Intake Review' && oldRequest.get(req.id).CRMT_Request_Status__c != 'CRMT Intake Review') {
				submitForIntakeReview(newRequest.get(req.id));
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + ' has been approved by the COR/GTL and is ready for review.';
                FeedItem feedToCG = createFeedItem(CRMS_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'CRMT Intake Leadership Review' && oldRequest.get(req.id).CRMT_Request_Status__c != 'CRMT Intake Leadership Review') {
				approveIntakeReview(newRequest.get(req.id));
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + ' is ready for CRMT Intake Leadership Review.';
                FeedItem feedToCG = createFeedItem(CRMT_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'CRMT Intake Review Complete' && oldRequest.get(req.id).CRMT_Request_Status__c != 'CRMT Intake Review Complete') {
				approveIntakeReview(newRequest.get(req.id));
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Draft' && oldRequest.get(req.id).CRMT_Request_Status__c == 'CRMT Intake Review') {
				rejectIntakeReview(newRequest.get(req.id));
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Draft' && oldRequest.get(req.id).CRMT_Request_Status__c == 'CRMT Intake Leadership Review') {
				rejectIntakeReview(newRequest.get(req.id));
			}

			// ROM Review //
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Initial ROM Review' && oldRequest.get(req.id).CRMT_Request_Status__c != 'Initial ROM Review') {
				submitForIntakeReview(newRequest.get(req.id));
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + ' is ready for Initial ROM Review.';
                FeedItem feedToCG = createFeedItem(CRMS_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'ROM Leadership Review' && oldRequest.get(req.id).CRMT_Request_Status__c != 'ROM Leadership Review') {
				approveIntakeReview(newRequest.get(req.id));
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + ' is ready for ROM Leadership Review.';
                FeedItem feedToCG = createFeedItem(CRMT_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'ROM Reviewed' && oldRequest.get(req.id).CRMT_Request_Status__c != 'ROM Reviewed') {
				approveIntakeReview(newRequest.get(req.id));
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'ROM Requested' && oldRequest.get(req.id).CRMT_Request_Status__c == 'Initial ROM Review') {
				rejectIntakeReview(newRequest.get(req.id));
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'ROM Requested' && oldRequest.get(req.id).CRMT_Request_Status__c == 'ROM Leadership Review') {
				rejectIntakeReview(newRequest.get(req.id));
			}

			// Proposal Review //
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Initial Proposal Review' && oldRequest.get(req.id).CRMT_Request_Status__c != 'Initial Proposal Review') {
				submitForIntakeReview(newRequest.get(req.id));
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + '  is ready for Initial Proposal Review.';
                FeedItem feedToCG = createFeedItem(CRMS_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Proposal Leadership Review' && oldRequest.get(req.id).CRMT_Request_Status__c != 'Proposal Leadership Review') {
				approveIntakeReview(newRequest.get(req.id));
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + '  is ready for Proposal Leadership Review.';
                FeedItem feedToCG = createFeedItem(CRMT_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Proposal Reviewed' && oldRequest.get(req.id).CRMT_Request_Status__c != 'Proposal Reviewed') {
				approveIntakeReview(newRequest.get(req.id));
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Proposal Requested' && oldRequest.get(req.id).CRMT_Request_Status__c == 'Initial Proposal Review') {
				rejectIntakeReview(newRequest.get(req.id));
			}
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Proposal Requested' && oldRequest.get(req.id).CRMT_Request_Status__c == 'Proposal Leadership Review') {
				rejectIntakeReview(newRequest.get(req.id));
			}

			// Review Complete
			if(newRequest.get(req.id).CRMT_Request_Status__c == 'Request Complete' && oldRequest.get(req.id).CRMT_Request_Status__c != 'Request Complete') {
				String feedBody = 'The ' + newRequest.get(req.id).Application_Name__c + ' Cloud Resource Request for ' + newRequest.get(req.id).CurrentWave__c + ' is now complete.';
                FeedItem feedToCG = createFeedItem(CRMT_GROUP,feedBody,MYNETWORKID);
                feedItemList.add(feedToCG);
			}
		}
		if(feedItemList.size() > 0) {
			insert feedItemList;
		}
	}

	public FeedItem createFeedItem(String parentId, String body, String networkId) {	
        FeedItem feedToCG = new FeedItem();	
		feedToCG.Body = body;
		feedToCG.ParentId = parentId;
		feedToCG.Type = 'TextPost';
		feedToCG.Visibility = 'AllUsers';
        feedToCG.NetworkScope = networkId;		
        return feedToCG;
	}

	public void submitForIntakeReview(Ocean_Request__c oceanReq) {
		Group CRMSQueue = [SELECT Id FROM Group WHERE Type = 'Queue' AND NAME = 'CRMS'];
		Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
		req1.setComments(oceanReq.Approval_Comments__c);
		req1.setObjectId(oceanReq.id);
		req1.setNextApproverIds(new Id [] {
							    CRMSQueue.id });
		// Submit the approval request for the Ocean Request
		Approval.ProcessResult result = Approval.process(req1);
	}


	/*** Get ProcessInstanceWorkItemId using SOQL ***/
	public Id getWorkItemId(Id targetObjectId) {
		Id retVal = null;
		for(ProcessInstanceWorkitem workItem :[Select p.Id from ProcessInstanceWorkitem p
											   where p.ProcessInstance.TargetObjectId = :targetObjectId]) {
			retVal  = workItem.Id;
		}

		return retVal;
	}

	/** This method will Approve the OceanRequest **/
	public void approveIntakeReview(Ocean_Request__c oceanReq) {
		Group CRMTQueue = [SELECT Id FROM Group WHERE Type = 'Queue' AND NAME = 'CRMT'];
		Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
		req.setComments(oceanReq.Approval_Comments__c);
		req.setAction('Approve');
		req.setNextApproverIds(new Id [] {
							   CRMTQueue.Id });
		Id workItemId = getWorkItemId(oceanReq.id);

		if(workItemId == null) {
			oceanReq.addError('Error Occured in Approval');
		} else {
			req.setWorkitemId(workItemId);
			Approval.ProcessResult result = Approval.process(req);
		}
	}

	/*** This method will Reject the Ocean Request ***/
	public void rejectIntakeReview(Ocean_Request__c oceanReq) {
		Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
		req.setComments(oceanReq.Approval_Comments__c);
		req.setAction('Reject');
		Id workItemId = getWorkItemId(oceanReq.id);

		if(workItemId == null) {
			oceanReq.addError('Error Occured in Trigger');
		} else {
			req.setWorkitemId(workItemId);
			Approval.ProcessResult result = Approval.process(req);
		}
	}
}