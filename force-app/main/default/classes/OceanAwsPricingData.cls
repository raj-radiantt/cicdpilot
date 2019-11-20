public with sharing class OceanAwsPricingData {
    @AuraEnabled(cacheable=true)
    public static List<AWS_PRICING_EC2__C> getEc2ComputePrice(OceanEc2PricingWrapper pricingRequest){
      List<AWS_PRICING_EC2__C> ec2Pricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_EC2__C WHERE OperatingSystem__c	= :pricingRequest.platform AND PreInstalledSW__c = :pricingRequest.preInstalledSW AND InstanceType__c= :pricingRequest.instanceType
       AND Location__c = :pricingRequest.region AND Tenancy__c= :pricingRequest.tenancy AND TermType__c = :pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength 
       AND PurchaseOption__c =:pricingRequest.purchaseOption AND CapacityStatus__c = :pricingRequest.capacityStatus];
      return ec2Pricing;
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
    public static List<AWS_PRICING_EC2__C> getElbRequestPrice(String balancingType, String region){
      List<AWS_PRICING_EC2__C> elbPricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_EC2__C WHERE ProductFamily__c	= :balancingType AND Location__c = :region];
      return elbPricing;
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
    public static SObject getDdbPrice(String instanceType, String region, String hadoopDistributionType){
      // SObject o =  [SELECT PricePerUnit__c FROM AWS_Pricing_EMR__c WHERE InstanceType__c = :instanceType AND Location__c = :region AND SoftwareType__c = :hadoopDistributionType LIMIT 1];
      return null;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getDataTransferRequestPrice(String volumeType, String region, Double storageSize){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_S3__c WHERE VolumeType__c = :volumeType AND Location__c =: region AND  (StartingRange__c < :storageSize OR StartingRange__c = 0)  AND (EndingRange__c  >= :storageSize OR EndingRange__c = 0) LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getWorkspaceRequestPrice(OceanWorkspacesPricingWrapper pricingRequest){
      SObject o =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_WORKSPACES__c WHERE Location__c = :pricingRequest.region AND GroupDescription__c = :pricingRequest.billingOption AND OperatingSystem__c = :pricingRequest.operatingSysytem AND License__c = :pricingRequest.license AND Storage__c = :pricingRequest.storage AND Bundle__c = :pricingRequest.bundle AND RunningMode__c = :pricingRequest.runningMode LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getS3RequestPrice(String volumeType, String region, Double storageSize){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_S3__c WHERE VolumeType__c = :volumeType AND Location__c =: region AND  (StartingRange__c < :storageSize OR StartingRange__c = 0)  AND (EndingRange__c  >= :storageSize OR EndingRange__c = 0) LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static List<AWS_PRICING_REDSHIFT__c> getRedshiftRequestPrice(OceanRedShiftPricingWrapper pricingRequest){
      List<AWS_PRICING_REDSHIFT__c> redShiftPricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_REDSHIFT__c WHERE InstanceType__c = :pricingRequest.instanceType AND Location__c =: pricingRequest.region AND  ProductFamily__c =: pricingRequest.productFamily AND  TermType__c = :pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength AND PurchaseOption__c =:pricingRequest.purchaseOption];
      return redShiftPricing;
    }
    
    @AuraEnabled(cacheable=true)
    public static SObject getOtherRequestPrice(String volumeType, String region, Double storageSize){
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_S3__c WHERE VolumeType__c = :volumeType AND Location__c =: region AND  (StartingRange__c < :storageSize OR StartingRange__c = 0)  AND (EndingRange__c  >= :storageSize OR EndingRange__c = 0) LIMIT 1];
      return o;
    }
    @AuraEnabled(cacheable=true)
    public static List<AWS_PRICING_RDS__c> getRdsRequestPrice(OceanRDSPricingWrapper pricingRequest){
      List<AWS_PRICING_RDS__c> rdsPricing =  [SELECT PricePerUnit__c, Unit__c   FROM AWS_PRICING_RDS__c WHERE Location__c 	= :pricingRequest.region AND InstanceType__c = :pricingRequest.instanceType
       AND TermType__c = :pricingRequest.termType AND LeaseContractLength__c= :pricingRequest.leaseContractLength AND PurchaseOption__c = :pricingRequest.purchaseOption 
       AND OfferingClass__c = :pricingRequest.offeringClass AND DatabaseEdition__c =: pricingRequest.databaseEdition AND DatabaseEngine__c =: pricingRequest.databaseEngine
       AND LicenseModel__c =: pricingRequest.licenseModel AND  DeploymentOption__c = :pricingRequest.deploymentOption];
      return rdsPricing;
    }
    @AuraEnabled(cacheable=true)
    public static SObject getRdsBkupRequestPrice(String region, String databaseEngine){
      SObject o = [SELECT PricePerUnit__c  FROM AWS_PRICING_RDS__c WHERE Location__c 	= :region AND DatabaseEngine__c = :databaseEngine AND ProductFamily__c = 'Storage Snapshot' LIMIT 1];
      return o;
    }
   
}