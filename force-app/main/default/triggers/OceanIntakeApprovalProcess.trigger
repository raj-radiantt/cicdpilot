trigger OceanIntakeApprovalProcess on Ocean_Request__c (After Update) {
    OceanIntakeApprovalProcess handler = new OceanIntakeApprovalProcess();
    for (Integer i = 0; i < Trigger.New.size(); i++) {
        if(Trigger.New[i].CRMT_Request_Status__c == 'COR/GTL Approval' && Trigger.old[i].CRMT_Request_Status__c != 'COR/GTL Approval') {
           handler.submitForIntakeReview(Trigger.new[i]);
        }
        if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Initial Intake Review Complete' && Trigger.old[i].CRMT_Request_Status__c != 'CRMT Initial Intake Review') {
            handler.approveIntakeReview(Trigger.new[i]);
        }
        if(Trigger.New[i].CRMT_Request_Status__c == 'CRMT Initial Intake Review Complete') {
            handler.approveIntakeReview(Trigger.new[i]);
        }
   }
}