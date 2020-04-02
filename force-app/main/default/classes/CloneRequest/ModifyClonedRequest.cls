public with sharing class ModifyClonedRequest {
    @AuraEnabled
    public static void getChangedFields(Id reqId,Id recordId, String resourceName) {
        List<Schema.sObjectField> changedFields = new list<Schema.sObjectField> ();
        SObject o1 = Trigger.oldMap.get(recordId);
        SObject o2 = Trigger.newMap.get(recordId);

        Ocean_Request__c oceanReq = [SELECT Id, Cloned__c FROM Ocean_Request__c WHERE Id=:reqId WITH SECURITY_ENFORCED];
        if(oceanReq.Cloned__c == true){
            DescribeSObjectResult describeResult = recordId.getSObjectType().getDescribe();      
            Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
        
            for (Schema.sObjectField field : fieldMap.values()) {
                system.debug('field::'+String.valueOf(field));
                string lastModifiedDate = 'LastModifiedDate';
                string modifiedBy = 'LastModifiedById';
                string modStamp = 'SystemModstamp';
                string resName = 'Name';
                if((String.valueOf(field) != lastModifiedDate) && (String.valueOf(field) != modifiedBy) && (String.valueOf(field) != modStamp) && (String.valueOf(field) != resName)){
                    Object v1 = o1.get(field);
                    Object v2 = o2.get(field);
                
                    if (didFieldChange(v1, v2)) {
                        changedFields.add(field);
                    }
                }
            }

            if(changedFields.size() > 0){
                String awsQuery = 'SELECT Id,Modify__c FROM '+String.escapeSingleQuotes(resourceName)+' WHERE Id=:recordId LIMIT 1';
                SObject s = Database.query(awsQuery);
                s.put('Modify__c', true);
                update s;
            }
        }
    }
    
    private static Boolean didFieldChange(Object v1, Object v2) {
        if (v1 == null && v2 == null) {
            return false;
        }
        if (v1 != v2) {
            return true;
        }
        return false;
    }
}
