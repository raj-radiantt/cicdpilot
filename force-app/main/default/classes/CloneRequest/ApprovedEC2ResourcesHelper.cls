public with sharing class ApprovedEC2ResourcesHelper {
    public static void getApprovedEC2Resources(List<Id> requestIds){
        List<OCEAN_Ec2Instance__c> modifiedEC2List = new List<OCEAN_Ec2Instance__c>();
        List<Id> ec2Ids = new List<Id>();
        List<OCEAN_Ec2Instance__c> ec2Resources = [SELECT Id,Name,Ocean_Request_Id__c,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,Modify__c,AWS_Availability_Zone__c, 
                                                   AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,
                                                   Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,
                                                   Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c IN: requestIds AND Resource_Status__c = 'Approved' 
                                                   WITH SECURITY_ENFORCED];
        
        for(OCEAN_Ec2Instance__c ec2 : ec2Resources){           
            ec2Ids.add(ec2.id);
        }
        
       createEc2CSVFile(ec2Ids);
       createCRRCSVFile(requestIds);
    }

    @future
    public static void createEc2CSVFile(List<Id> ec2Ids){
        List<OCEAN_Ec2Instance__c> ec2Resources = [SELECT Id,Name,Ocean_Request_Id__c,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,Modify__c,AWS_Availability_Zone__c, 
                                                   AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,
                                                   Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,
                                                   Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c IN: ec2Ids WITH SECURITY_ENFORCED];

        String ec2FileContent = 'EC2Id,Name,CRRId,ADOFundigType,ADONotes,ApplicationComponent,AWSAccounts,AWSAvailabilityZone,AWSRegion,Tenancy,InstanceType,InstanceQuantity,Platform,ResourceStatus,Environment'+'\n';

        for (OCEAN_Ec2Instance__c ec2 : ec2Resources){
            ec2FileContent +=  ec2.Id+ ',' + ec2.Name+','+ec2.Ocean_Request_Id__c+','+ec2.ADO_FUNDING_TYPE__c+','+ec2.ADO_Notes__c+','+ec2.Application_Component__c+
                            ','+ec2.AWS_Accounts__c+','+ec2.AWS_Availability_Zone__c+','+ec2.AWS_Region__c+','+ec2.Tenancy__c+','+ec2.EC2_Instance_Type__c+','+
                            ec2.Instance_Quantity__c+','+ec2.Platform__c+','+ec2.Resource_Status__c+','+ec2.Environment__c; 
            ec2FileContent += '\n';
        }

        ContentVersion cv = new ContentVersion();
        cv.title = 'ModifiedEC2Records';
        cv.versiondata = Blob.valueOf(ec2FileContent);
        cv.pathonclient = 'ModifiedEC2Records.csv';
        insert cv;
    }

    @future
    public static void createCRRCSVFile(List<Id> reqIds){
        List<Ocean_Request__c> reqList = [SELECT Id,Name,AWSInstances__c,Assumptions__c,CRMT_Request_Status__c,Request_Status__c,
                                          Review_Outcome__c FROM Ocean_Request__c WHERE Id IN: reqIds];

        String reqFileContent = 'Id,Name,AWSInstances,Assumptions,RequestStatus,CRMTRequestStatus,ReviewOutcome'+'\n';
        for(Ocean_Request__c req : reqList){
            reqFileContent += req.Id+','+req.Name+','+req.AWSInstances__c+','+req.Assumptions__c+','+req.Request_Status__c+','+
                              req.CRMT_Request_Status__c+','+req.Review_Outcome__c;
            reqFileContent += '\n';
        }

        ContentVersion cv = new ContentVersion();
        cv.title = 'ApprovedCloudResourceRequests';
        cv.versiondata = Blob.valueOf(reqFileContent);
        cv.pathonclient = 'ApprovedCloudResourceRequests.csv';
        insert cv;
    }
}
