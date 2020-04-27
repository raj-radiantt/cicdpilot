trigger ModifyClonedEC2Instance on OCEAN_Ec2Instance__c (after update) {
    if(ModifyClonedRequest.isRecursive == true) {
            ModifyClonedRequest.getChangedFields(Trigger.newMap.keySet(),Trigger.new[0].Ocean_Request_Id__c, 'OCEAN_Ec2Instance__c');       
    }
}