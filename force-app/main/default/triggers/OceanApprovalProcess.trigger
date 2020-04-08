trigger OceanApprovalProcess on Ocean_Request__c (After Update) {
    OceanApprovalProcess handler = new OceanApprovalProcess();
    OceanUpdateResourceStatus updateHandler = new OceanUpdateResourceStatus();

    if(Trigger.isAfter && Trigger.isUpdate){
            handler.crmtAdminReview(Trigger.newMap, Trigger.oldMap);
            // Update all the child AWS resources status to 'Under Review' & 'Approved' //
            updateHandler.updateResourceStatus(Trigger.New);
            List<Id> reqIds = new List<Id>();
            for(Ocean_Request__c oceanReq : Trigger.new){
                if(oceanReq.Review_Outcome__c == 'Approved'){
                    reqIds.add(oceanReq.Id);
                }
            }
            ApprovedEC2ResourcesHelper.getApprovedEC2Resources(reqIds);
    }
}