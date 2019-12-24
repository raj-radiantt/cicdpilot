global class Ec2PricingBatch implements Database.Batchable<sObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
       String query = 'SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_EC2__C WHERE OperatingSystem__c	= :pricingRequest.platform AND PreInstalledSW__c = :pricingRequest.preInstalledSW AND InstanceType__c= :pricingRequest.instanceType'
       +' '+'AND Location__c = :pricingRequest.region AND Tenancy__c= :pricingRequest.tenancy AND TermType__c = :pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength' 
       +' '+'AND PurchaseOption__c =:pricingRequest.purchaseOption AND CapacityStatus__c = :pricingRequest.capacityStatus';
       return Database.getQueryLocator(query);
    }
    global void execute(Database.BatchableContext bc, List<AWS_PRICING_EC2__C> scope){
        for(AWS_PRICING_EC2__C awsEc2 : scope) {
          //  insert awsEc2;
        }
    }    
    global void finish(Database.BatchableContext bc){
        
    }    
}