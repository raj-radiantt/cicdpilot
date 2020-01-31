public with sharing class OceanAwsPricingData {    

    @AuraEnabled
    public static List<AWS_PRICING_EC2__C> getEc2ComputePrice(OceanEc2PricingWrapper pricingRequest){
      List<AWS_PRICING_EC2__C> ec2Pricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_EC2__C WHERE OperatingSystem__c	= :pricingRequest.platform AND PreInstalledSW__c = :pricingRequest.preInstalledSW AND InstanceType__c= :pricingRequest.instanceType
       AND Location__c = :pricingRequest.region AND Tenancy__c= :pricingRequest.tenancy AND TermType__c = :pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength 
       AND PurchaseOption__c =:pricingRequest.purchaseOption AND CapacityStatus__c = :pricingRequest.capacityStatus];
      return ec2Pricing;
    }

    @AuraEnabled(cacheable=true)
    public static Decimal getEbsStoragePrice(OceanEbsPricingWrapper pricingRequest){
      system.debug('pricingRequest:::'+pricingRequest);
      Decimal cost = 0;
      AWS_PRICING_EC2__C ebs =  [SELECT PricePerUnit__c FROM AWS_PRICING_EC2__C  WHERE VolumeType__c	= : pricingRequest.volumeType AND StorageMedia__c = : pricingRequest.storageMedia
       AND Location__c = : pricingRequest.region AND ProductFamily__c = 'Storage' LIMIT 1];
      
      AWS_PRICING_EC2__C ebsIops =  [SELECT PricePerUnit__c,Unit__c FROM AWS_PRICING_EC2__C  WHERE ProductFamily__c = 'System Operation' AND Unit__c = 'IOPS-Mo' LIMIT 1];
        
        Decimal instanceMonths = (pricingRequest.noOfVolume * pricingRequest.averageDuration) /730 ;
        if(pricingRequest.volumeType == 'Provisioned IOPS'){
          cost += (instanceMonths * ebs.PricePerUnit__c * pricingRequest.storageSize * pricingRequest.numberOfMonths) +
                  (instanceMonths * ebsIops.PricePerUnit__c * pricingRequest.iops);
        } else {
          cost += instanceMonths * ebs.PricePerUnit__c * pricingRequest.storageSize * pricingRequest.numberOfMonths; 
        }

        Decimal TotalSnapshot = 0;
        switch on pricingRequest.snapshotFrequency {
          when ('Hourly'){
            TotalSnapshot = 729;
          }
          when ('Daily'){
            TotalSnapshot = 30;
          }
          when ('2x Daily'){
            TotalSnapshot = 59.83;
          }
          when ('3x Daily'){
            TotalSnapshot = 90.25;
          }
          when ('4x Daily'){
            TotalSnapshot = 120.67;
          }
          when ('6x Daily'){
            TotalSnapshot = 181.5;
          }
          when ('Weekly'){
            TotalSnapshot = 3;
          }
          when ('Monthly'){
            TotalSnapshot = 1;
          }
          when else {
            TotalSnapshot = 0;
          }
        }
  
      Decimal snapshotCost = 0;
      snapshotCost += ((pricingRequest.storageSize * 0.05) + ((pricingRequest.snapshotStorage * 0.05) / 2) * TotalSnapshot) *instanceMonths ;

      if(pricingRequest.snapshotFrequency == 'No snapshot storage') {
        cost = cost;
      } else {
        cost += snapshotCost;
      }

      return cost;
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
    public static Decimal getEmrRequestPrice(OceanEMRPricingWrapper pricingRequest){
      system.debug('pricingRequest:::'+pricingRequest);
      List<AWS_Pricing_EMR__c> emrCostList = [SELECT PricePerUnit__c FROM AWS_Pricing_EMR__c WHERE InstanceType__c = :pricingRequest.instanceType AND Location__c = :pricingRequest.region AND SoftwareType__c = :pricingRequest.hadoopDistributionType LIMIT 1];

      List<AWS_PRICING_EC2__c> ec2CostList = [SELECT PricePerUnit__c,Unit__c FROM AWS_PRICING_EC2__c WHERE                        InstanceType__c =: pricingRequest.instanceType
                          AND Location__c  =: pricingRequest.region AND OperatingSystem__c  ='Linux' 
                          AND TermType__c  =:pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength 
                          AND PurchaseOption__c =:pricingRequest.purchaseOption AND Tenancy__c  = 'Shared' AND PreInstalledSW__c = '' AND CapacityStatus__c  = 'Used'];
      
      Decimal ec2Cost = 0;
      Decimal emrCost = 0;
      try{
        emrCost = emrCostList[0].PricePerUnit__c * pricingRequest.instanceQuantity * pricingRequest.uptimePerDay *pricingRequest.uptimePerMonth
          * pricingRequest.monthsRequested; 
      } catch(Exception e) {

      }

      for(AWS_PRICING_EC2__c ec2 : ec2CostList) {
        if(ec2.Unit__c == 'Quantity') {
          ec2Cost += ec2.PricePerUnit__c * pricingRequest.instanceQuantity;
        } else {
          ec2Cost += ec2.PricePerUnit__c * pricingRequest.instanceQuantity * pricingRequest.uptimePerDay * pricingRequest.uptimePerMonth
          * pricingRequest.monthsRequested;
        }
      }
      return emrCost + ec2Cost;
    }

    @AuraEnabled(cacheable=true)
    public static SObject getDataTransferRequestPrice(String transferType, String region){
      String toRegion = transferType == 'IntraRegion' ? region : region == 'US East (N. Virginia)' ? 'US West (Oregon)' : 'US East (N. Virginia)';
      SObject o =  [SELECT PricePerUnit__c FROM AWS_PRICING_DATA_TRANSFER__c WHERE FromLocation__c =: region AND ToLocation__c =: toRegion AND TransferType__c =: transferType LIMIT 1];
      return o;
    }

    @AuraEnabled(cacheable=true)
    public static SObject getWorkspaceRequestPrice(OceanWorkspacesPricingWrapper pricingRequest){
      List<SObject> oList =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_WORKSPACES__c WHERE Location__c =: pricingRequest.region AND GroupDescription__c = :pricingRequest.billingOption AND OperatingSystem__c = :pricingRequest.operatingSysytem AND License__c = :pricingRequest.license AND Storage__c = :pricingRequest.storage AND Bundle__c = :pricingRequest.bundle AND RunningMode__c = :pricingRequest.runningMode AND ResourceType__c = 'Hardware' LIMIT 1];
      if(oList.size() > 0){
        return oList[0];
      }
      return null;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<AWS_PRICING_LAMBDA__c> getLambdaRequestPrice(String region){

      List<AWS_PRICING_LAMBDA__c> lambdaPricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_LAMBDA__c WHERE Location__c =: region AND Unit__c IN ('Requests', 'seconds')];

      return lambdaPricing;
    }
       
    @AuraEnabled(cacheable=true)
    public static List<AWS_PRICING_REDSHIFT__c> getRedshiftRequestPrice(OceanRedShiftPricingWrapper pricingRequest){
      List<AWS_PRICING_REDSHIFT__c> redShiftPricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_REDSHIFT__c WHERE InstanceType__c = :pricingRequest.instanceType AND Location__c =: pricingRequest.region AND  ProductFamily__c =: pricingRequest.productFamily AND  TermType__c = :pricingRequest.termType AND OfferingClass__c = :pricingRequest.offeringClass AND LeaseContractLength__c =:pricingRequest.leaseContractLength AND PurchaseOption__c =:pricingRequest.purchaseOption];
      return redShiftPricing;
    }

    @AuraEnabled(cacheable=true)
    public static List<AWS_PRICING_RDS__c> getRdsRequestPrice(OceanRDSPricingWrapper pricingRequest){
      List<AWS_PRICING_RDS__c> rdsPricing =  [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_RDS__c WHERE Location__c 	= :pricingRequest.region AND InstanceType__c = :pricingRequest.instanceType
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

    @AuraEnabled(cacheable=true)
    public static Decimal getDynamoDBPrice(OceanDynamoDBPricingWrapper pricingRequest){

      Decimal cost = 0;
  
      List<AWS_PRICING_DYNAMO_DB__c> storagePrices = [SELECT PricePerUnit__c, Unit__c FROM AWS_PRICING_DYNAMO_DB__c WHERE Location__c =: pricingRequest.region AND TermType__c = 'OnDemand' AND  ProductFamily__c = 'Database Storage' AND VolumeType__c = 'Amazon DynamoDB - Indexed DataStore' AND PricePerUnit__c > 0];

      Decimal dataStorage = Decimal.valueOf(pricingRequest.dataStorage);

      for(AWS_PRICING_DYNAMO_DB__c p : storagePrices){
        cost +=  (dataStorage < 25 ? 0 : dataStorage - 25)  * p.PricePerUnit__c;
      }

      switch on  pricingRequest.termType{
        when  'Reserved' {
          List<AWS_PRICING_DYNAMO_DB__c> prices = [SELECT PricePerUnit__c, Unit__c, Group__c FROM AWS_PRICING_DYNAMO_DB__c WHERE Location__c =: pricingRequest.region AND TermType__c = 'Reserved' AND LeaseContractLength__c =: pricingRequest.leaseContractLength];

          for(AWS_PRICING_DYNAMO_DB__c p : prices){
            Decimal partialCost = (p.Group__c == 'DDB-WriteUnits') ? Decimal.valueOf(pricingRequest.writeUnits) * p.PricePerUnit__c : Decimal.valueOf(pricingRequest.readUnits) * p.PricePerUnit__c;
            
            cost += p.Unit__c == 'Quantity' ? partialCost : partialCost * 730 * Decimal.valueOf(pricingRequest.numberOfMonths);
          }
        }
        when  'OnDemand' {
          List<AWS_PRICING_DYNAMO_DB__c> prices= [SELECT PricePerUnit__c, Unit__c, Group__c FROM AWS_PRICING_DYNAMO_DB__c WHERE Location__c =: pricingRequest.region AND TermType__c = 'OnDemand' AND  ProductFamily__c = 'Amazon DynamoDB PayPerRequest Throughput' AND Unit__c != 'ReplicatedWriteRequestUnits'];
          for(AWS_PRICING_DYNAMO_DB__c p : prices){
            Decimal partialCost = (p.Group__c == 'DDB-WriteUnits') ? Decimal.valueOf(pricingRequest.writeUnits) * p.PricePerUnit__c : Decimal.valueOf(pricingRequest.readUnits) * p.PricePerUnit__c;
            cost += partialCost;
          }
        }
        when  'Provisioned Capacity' {
          List<AWS_PRICING_DYNAMO_DB__c> prices= [SELECT PricePerUnit__c, Unit__c, Group__c FROM AWS_PRICING_DYNAMO_DB__c WHERE Location__c =: pricingRequest.region AND TermType__c = 'OnDemand' AND  ProductFamily__c = 'Provisioned IOPS' AND PricePerUnit__c > 0];
          for(AWS_PRICING_DYNAMO_DB__c p : prices){
            Decimal partialCost = (p.Group__c == 'DDB-WriteUnits') ? Decimal.valueOf(pricingRequest.writeUnits) * p.PricePerUnit__c : Decimal.valueOf(pricingRequest.readUnits) * p.PricePerUnit__c;
            cost += partialCost * 730;
          }
        }
      }
      //If Reserved, requested months not factored in
      cost *= (pricingRequest.termType == 'Reserved') ? 1 : Decimal.valueOf(pricingRequest.numberOfMonths);
      return cost;
    }
   
   @AuraEnabled(cacheable=true)
    public static Decimal getS3RequestPrice(OceanS3PricingWrapper pricingRequest){

      Decimal cost = 0;

      Decimal storageCost =  [SELECT PricePerUnit__c FROM AWS_PRICING_S3__c WHERE VolumeType__c = :pricingRequest.volumeType AND Location__c =: pricingRequest.region AND  (StartingRange__c < :pricingRequest.storageSize OR StartingRange__c = 0)  AND (EndingRange__c  >= :pricingRequest.storageSize OR EndingRange__c = 0) LIMIT 1].PricePerUnit__c * pricingRequest.storageSize;

      Decimal requestsCost = 0;

      String getRequestsLabel = '';
      String putCopyListRequestsLabel = '';

      switch on pricingRequest.volumeType {
        when  'Standard'{
          getRequestsLabel = 'S3-API-Tier2';
          putCopyListRequestsLabel = 'S3-API-Tier1';
        }
        when  'Standard - Infrequent Access'{
          getRequestsLabel = 'S3-API-SIA-Tier2';
          putCopyListRequestsLabel = 'S3-API-SIA-Tier1';
        }
        
        when  'One Zone - Infrequent Access'{
          getRequestsLabel = 'S3-API-ZIA-Tier2';
          putCopyListRequestsLabel = 'S3-API-ZIA-Tier1';
        }
        when 'Amazon Glacier'{
          getRequestsLabel = 'S3-API-GLACIER-Tier2';
          putCopyListRequestsLabel = 'S3-API-GLACIER-Tier1';
        }
        when  'Intelligent-Tiering Frequent Access', 'Intelligent-Tiering InFrequent Access'{
          getRequestsLabel = 'S3-API-INT-Tier2';
          putCopyListRequestsLabel = 'S3-API-INT-Tier1';
        }
      } 

      requestsCost += [SELECT PricePerUnit__c FROM AWS_PRICING_S3__c WHERE Group__c =: putCopyListRequestsLabel AND Location__c =: pricingRequest.region AND (Operation__c = '' OR Operation__c = 'PutObject') LIMIT 1].PricePerUnit__c * pricingRequest.noPutCopyListRequests;
      requestsCost += [SELECT PricePerUnit__c FROM AWS_PRICING_S3__c WHERE Group__c =: getRequestsLabel AND Location__c =: pricingRequest.region LIMIT 1].PricePerUnit__c * pricingRequest.noGetRequests;

      cost = (storageCost + requestsCost) * pricingRequest.requestedMonths;

      return cost;
    }
}