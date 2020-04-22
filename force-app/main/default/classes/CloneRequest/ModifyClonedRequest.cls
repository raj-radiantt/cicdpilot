public with sharing class ModifyClonedRequest {
    @AuraEnabled
    public static void getChangedFields(Id reqId,Id recordId, String resourceName) {
        List<Schema.sObjectField> changedFields = new list<Schema.sObjectField> ();
        SObject o1 = Trigger.oldMap.get(recordId); // get the record values before update
        SObject o2 = Trigger.newMap.get(recordId); // get the record values after update

        Ocean_Request__c oceanReq = [SELECT Id, Cloned__c,Current_OY__c,CRMT_Request_Status__c,Request_Status__c FROM Ocean_Request__c WHERE Id=:reqId WITH SECURITY_ENFORCED];
        if((oceanReq.Cloned__c == true || oceanReq.Current_OY__c == true) && oceanReq.CRMT_Request_Status__c != 'CRMT Intake Review' &&  oceanReq.CRMT_Request_Status__c != 'Attestation Requested'){
            DescribeSObjectResult describeResult = recordId.getSObjectType().getDescribe();      
            Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
        
            for (Schema.sObjectField field : fieldMap.values()) {
                system.debug('field::'+String.valueOf(field));
                string lastModifiedDate = 'LastModifiedDate';
                string modifiedBy = 'LastModifiedById';
                string modStamp = 'SystemModstamp';
                string resName = 'Name';
                if((String.valueOf(field) != lastModifiedDate) && (String.valueOf(field) != modifiedBy) && (String.valueOf(field) != modStamp) && (String.valueOf(field) != resName)){
                    Object beforeUpd = o1.get(field);
                    Object afterUpd = o2.get(field);
                
                    if (didFieldChange(beforeUpd, afterUpd)) {
                        changedFields.add(field);
                    }
                }
            }
            // if any of the field value is changed then make the Modify__c field to true
            if(changedFields.size() > 0){
                String awsQuery = 'SELECT Id,Modify__c,Resource_Status__c FROM '+String.escapeSingleQuotes(resourceName)+' WHERE Id=:recordId LIMIT 1';
                SObject s = Database.query(awsQuery);
                if(oceanReq.Cloned__c == true){
                    s.put('Modify__c', true); 
                    s.put('Resource_Status__c','New');
                    update s;
                } else if(oceanReq.Current_OY__c == true){
                    s.put('Resource_Status__c','New');
                    update s;
                }
            }
        }
    }

    //Method to check if the field value has changed
    private static Boolean didFieldChange(Object beforeUpd, Object afterUpd) {
        if (beforeUpd == null && afterUpd == null) {
            return false;
        }
        if (beforeUpd != afterUpd) {
            return true;
        }
        return false;
    }
}
