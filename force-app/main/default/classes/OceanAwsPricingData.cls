public with sharing class OceanAwsPricingData {
    @AuraEnabled(cacheable=true)
    public static SObject getEc2ComputePrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEbsStoragePrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getVpcRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEfsRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getRdsRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getElbRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEmrRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
       return o;
    }
}
