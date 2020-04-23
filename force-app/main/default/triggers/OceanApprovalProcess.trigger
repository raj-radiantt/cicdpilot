trigger OceanApprovalProcess on Ocean_Request__c (After Update) {
    OceanApprovalProcess handler = new OceanApprovalProcess();
    OceanUpdateResourceStatus updateHandler = new OceanUpdateResourceStatus();

    if(Trigger.isAfter && Trigger.isUpdate){
            handler.crmtAdminReview(Trigger.newMap, Trigger.oldMap);
            // Update all the child AWS resources status to 'Under Review' & 'Approved' //
            updateHandler.updateResourceStatus(Trigger.New,Trigger.old);

            //To get the Requests with Review Outcome as approved and create a CSV File.
            List<Id> reqIds = new List<Id>();
            for(Ocean_Request__c oceanReq : Trigger.new){
                if(Trigger.newmap.get(oceanReq.id).Request_Status__c == 'Request Complete' && Trigger.oldmap.get(oceanReq.id).Request_Status__c != 'Request Complete'){
                    ApprovedEC2ResourcesHelper.updateReviewOutcome(oceanReq.Id);
                    reqIds.add(oceanReq.Id);
                }
            }
            if(reqIds.size() > 0){
                    ApprovedEC2ResourcesHelper.getApprovedEC2Resources(reqIds);
            }
    }
}