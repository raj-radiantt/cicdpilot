trigger ModifyClonedWKSPCInstance on Ocean_Workspaces_Request__c (after update) {
    for(Ocean_Workspaces_Request__c wkspc : Trigger.New){
        ModifyClonedRequest.getChangedFields(wkspc.Ocean_Request_Id__c,wkspc.id, 'Ocean_Workspaces_Request__c');
    }
}