public with sharing class OceanAwsPricingData {
    @AuraEnabled(cacheable=true)
    public static SObject getEc2ComputePrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM AWS_PRICING_EC2_COMPUTE__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEbsStoragePrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM AWS_PRICING_EC2_COMPUTE__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getVpcRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM AWS_PRICING_EC2_COMPUTE__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
}
