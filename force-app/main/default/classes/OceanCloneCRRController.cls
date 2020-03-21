public with sharing class OceanCloneCRRController {
   @AuraEnabled
   public static Ocean_Request__c cloneRequest(Id reqId){
      Ocean_Request__c clonedReq = new Ocean_Request__c();
      List<SObject> clonedAWSResources = new List<SObject>();
      Ocean_Request__c oceanReq = [SELECT Id,Name,AWSInstances__c,Request_Status__c,CRMT_Request_Status__c FROM Ocean_Request__c WHERE Id =: reqId];
            
      // Clone the Cloud Resource Request
      clonedReq = oceanReq.clone(false,true);
      clonedReq.Request_Status__c = 'Draft';
      clonedReq.CRMT_Request_Status__c = 'Draft';
      insert clonedReq;

      // Clone the Related Lists records
        String[] awsInstances = oceanReq.AWSInstances__c.split(';');
        for(AWS_Resource__mdt aws: [SELECT DeveloperName,MasterLabel,API_Name__c,Sequence__c FROM AWS_Resource__mdt WHERE MasterLabel IN: awsInstances]) {
          cloneCRRResources(aws.API_Name__c,oceanReq.Id,clonedReq.Id);
        }         
    
      return clonedReq;         
   }

   // Method to clone the AWS Resources related to the Cloud Resource Request
   public static void cloneCRRResources(String awsResource, Id reqId, Id clonedReqId){
    String resourceAPIName = awsResource;
    List<SObject> awsResourceList = new List<SObject>();
    List<SObject> clonedAWSResourceList = new List<SObject>();
    String queryStr = 'SELECT Id,Name,Ocean_Request_Id__c,AWS_Accounts__c, EC2_Instance_Type__c, Environment__c, Instance_Quantity__c, PerInstanceUptimePerDay__c, PerInstanceUptimePerMonth__c, Per_Instance_Running_Months_in_Remaining__c, Platform__c FROM '+resourceAPIName+' WHERE Ocean_Request_Id__c =: reqId';
    awsResourceList = Database.query(queryStr);
    clonedAWSResourceList = awsResourceList.deepClone();

    for(SObject awsRes: clonedAWSResourceList){
      awsRes.put('Ocean_Request_Id__c',clonedReqId) ;
    }

    insert clonedAWSResourceList;
   } 

}
