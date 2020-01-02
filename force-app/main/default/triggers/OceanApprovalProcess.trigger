trigger OceanApprovalProcess on Ocean_Request__c (After Update) {
    OceanApprovalProcess handler = new OceanApprovalProcess();
    OceanUpdateResourceStatus updateHandler = new OceanUpdateResourceStatus();

    if(Trigger.isAfter && Trigger.isUpdate){
        for(Ocean_Request__c oc : Trigger.New) {
            handler.CRMTAdminReview(Trigger.New, Trigger.old);
            // Update all the child AWS resources status to 'Under Review' & 'Approved' //
            updateHandler.updateResourceStatus(Trigger.New);
        } 
    }
}
