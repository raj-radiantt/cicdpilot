public with sharing class OceanDataOptions {     
    @AuraEnabled(cacheable=true)
    public static Map < String, String > getAwsEc2Types() {   
         Map < String, String > d = new Map < String, String >();     
         Schema.DescribeFieldResult fieldResult = OCEAN_Ec2Instance__c.EC2_Instance_Type__c	.getDescribe();         
         List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();         
         for( Schema.PicklistEntry pickListVal : ple) {             
             d.put(pickListVal.getLabel(), pickListVal.getLabel());        
         }  
         return d;
   } 
 }