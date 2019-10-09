public with sharing class OceanAwsPricingData {
    public OceanAwsPricingData() {

    }
    @AuraEnabled(Cacheable = true)
    public static List<Account> getPrice(){
      return [SELECT OnDemand_hourly_cost__c FROM AWS_PRICING_EC2_COMPUTE__c where Platform__c	= ''
       AND Region__c = '' AND Pricing_model__c= '' AND Reservation_term__c = '' AND Payment_Options__c = ''];
    }
}
