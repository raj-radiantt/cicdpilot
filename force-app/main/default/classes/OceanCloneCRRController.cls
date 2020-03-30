public with sharing class OceanCloneCRRController {
   @AuraEnabled
   public static String cloneRequest(String reqId){
      Ocean_Request__c clonedReq = new Ocean_Request__c();
      List<SObject> clonedAWSResources = new List<SObject>();
      Map<String, Schema.SObjectField> fieldMap = Ocean_Request__c.sObjectType.getDescribe().fields.getMap();
      Set<String> fieldNames = fieldMap.keySet();
      List<String> reqFieldList = new List<String>();
      reqFieldList.addAll(fieldNames);
      string reqFields = string.join(reqFieldList, ',');

      Ocean_Request__c oceanReq = Database.query('select ' + reqFields + ' from Ocean_Request__c where id=: reqId');
     
      // Clone the Cloud Resource Request
      clonedReq = oceanReq.clone(false,true);
      clonedReq.Request_Status__c = 'Draft';
      clonedReq.CRMT_Request_Status__c = 'Draft';
      clonedReq.Submitted_Date__c = null;
      clonedReq.Review_Status__c = '';
      insert clonedReq;

      // Clone the Related Lists records
        String[] awsInstances = oceanReq.AWSInstances__c.split(';');
        for(AWS_Resource__mdt aws: [SELECT DeveloperName,MasterLabel,API_Name__c,Sequence__c FROM AWS_Resource__mdt WHERE MasterLabel IN: awsInstances]) {
          cloneCRRResources(aws.API_Name__c,oceanReq.Id,clonedReq.Id);
        }         
    
      return clonedReq.id;         
   }

   // Method to clone the AWS Resources related to the Cloud Resource Request
   public static void cloneCRRResources(String awsResource, Id reqId, Id clonedReqId){
    String resourceAPIName = awsResource;
    String awsQuery = 'SELECT Id FROM '+resourceAPIName+' LIMIT 1';
		SObject s = Database.query(awsQuery);
		Id awsId = s.Id; 
 
    DescribeSObjectResult describeResult = awsId.getSObjectType().getDescribe();      
    Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
          
    // Get all of the fields on the object
    Set<String> fieldNames = fieldMap.keySet();
		List<String> fieldList = new List<String>();
		fieldList.addAll(fieldNames);
    String fields = string.join(fieldList, ',');
    String status = 'Approved';
    String status1 = 'Under Review';
		String queryStr = ' SELECT ' + fields + ' FROM ' + describeResult.getName() + ' Where Ocean_Request_Id__c =: reqId AND (Resource_Status__c =: status OR Resource_Status__c =: status1)';

    List<SObject> awsResourceList = new List<SObject>();
    awsResourceList = Database.query(queryStr);
    List<SObject> clonedAWSResourceList = new List<SObject>();
    clonedAWSResourceList = awsResourceList.deepClone();

    for(SObject awsRes: clonedAWSResourceList){
      awsRes.put('Ocean_Request_Id__c',clonedReqId) ;
    }
    insert clonedAWSResourceList;
   } 

}
