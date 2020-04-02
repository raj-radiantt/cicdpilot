trigger ModifyClonedEC2Instance on OCEAN_Ec2Instance__c (after update) {
    for(OCEAN_Ec2Instance__c ec2 : Trigger.New){
        ModifyClonedRequest.getChangedFields(ec2.Ocean_Request_Id__c,ec2.id, 'OCEAN_Ec2Instance__c');
    }
}