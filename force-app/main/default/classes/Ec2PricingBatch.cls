global class Ec2PricingBatch implements Database.Batchable<sObject> {
    // OceanEc2PricingWrapper pricingRequest = new OceanEc2PricingWrapper();
    String platform = 'RHEL';
    String tenancy = 'Shared';
    String region = 'US East (N. Virginia)';
    String purchaseOption = 'No Upfront';
    String capacityStatus = 'used';
    String termType = 'Reserved';
    String offeringClass = 'Standard';
    String leaseContractLength = '3yr';
    String preInstalledSW = 'SQL Ent';
    String instanceType = 't1 micro';
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
       String query = 'SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_EC2__C WHERE OperatingSystem__c	= :platform AND PreInstalledSW__c = :preInstalledSW AND InstanceType__c= :instanceType'
       +' '+'AND Location__c = :region AND Tenancy__c= :tenancy AND TermType__c = :termType AND OfferingClass__c = :offeringClass AND LeaseContractLength__c =:leaseContractLength' 
       +' '+'AND PurchaseOption__c =:purchaseOption AND CapacityStatus__c = :capacityStatus';
       return Database.getQueryLocator(query);
    }
    
    global void execute(Database.BatchableContext bc, List<AWS_PRICING_EC2__C> scope){
        for(AWS_PRICING_EC2__C awsEc2 : scope) {
            // Do nothing
        }
    }  
    
    global void finish(Database.BatchableContext bc){
        
    }    
}