public with sharing class OceanApprovalHistoryWrapper {
    @AuraEnabled
    public String stepName { get; set; }
    @AuraEnabled
    public String stepStatus { get; set; }
    @AuraEnabled
    public String comments { get; set; }
    @AuraEnabled
    public String approver { get; set; }
    @AuraEnabled
    public String createdDate { get; set; }
}
