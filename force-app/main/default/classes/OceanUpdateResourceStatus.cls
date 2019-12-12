public with sharing class OceanUpdateResourceStatus {
    public OceanUpdateResourceStatus() {}

    public void updateResourceStatus(Ocean_Request__c oceanReq){
        List<OCEAN_Ec2Instance__c> EC2List = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
    }
}
