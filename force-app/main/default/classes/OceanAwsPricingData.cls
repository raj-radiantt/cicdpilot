public with sharing class OceanAwsPricingData {
    @AuraEnabled(cacheable=true)
    public static SObject getEc2ComputePrice(OceanEc2PricingWrapper pricingRequest){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_EC2__C WHERE OperatingSystem__c	= :pricingRequest.platform AND PreInstalledSW__c = :pricingRequest.preInstalledSW AND InstanceType__c= :pricingRequest.instanceType
       AND Location__c = :pricingRequest.region AND Tenancy__c= :pricingRequest.tenancy AND TermType__c = :pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength 
       AND PurchaseOption__c =:pricingRequest.purchaseOption AND CapacityStatus__c = :pricingRequest.capacityStatus LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEbsStoragePrice(String region, String volumeType, string storageMedia){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_EC2__C  WHERE VolumeType__c	= :volumeType AND StorageMedia__c = :storageMedia
       AND Location__c = :region AND ProductFamily__c = 'Storage' LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEfsRequestPrice(String storageType, String region){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_EFS__C WHERE Location__c  = :region AND StorageClass__C= :storageType AND Operation__c = '' AND AccessType__c = '' LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getElbRequestPrice(String balancingType, String region){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_EC2__C WHERE ProductFamily__c	= :balancingType AND Location__c = :region AND Unit__c = 'Hrs' LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getVpcRequestPrice(String region){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_VPC__C  WHERE Location__c	= :region AND ProductFamily__c = 'VpcEndpoint' AND Unit__c = 'Hrs' LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getEmrRequestPrice(String instanceType, String region, String hadoopDistributionType){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_Pricing_EMR__c WHERE InstanceType__c = :instanceType AND Location__c = :region AND SoftwareType__c = :hadoopDistributionType LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getRdsRequestPrice(String instanceType, String platform, String pricingModel, String region, String paymentOption, Integer reservationTerm){
      SObject o =  [SELECT OnDemand_hourly_cost__c FROM Ocean_AWS_Pricing_EC2_Compute__c where Platform__c	= :platform AND Instance_Type__c= :instanceType
       AND Region__c = :region AND Pricing_model__c= :pricingModel AND Reservation_term__c = :reservationTerm AND Payment_Options__c = :paymentOption LIMIT 1];
      return o;
    }
   
}