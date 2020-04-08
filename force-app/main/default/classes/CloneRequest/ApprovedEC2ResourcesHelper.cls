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

    public static void createEc2CSVFile(List<Id> ec2Ids){
        List<OCEAN_Ec2Instance__c> ec2Resources = [SELECT Id,Name,Ocean_Request_Id__c,ADO_FUNDING_TYPE__c,ADO_Notes__c,Application_Component__c,Modify__c,AWS_Availability_Zone__c, 
                                                   AWS_Accounts__c,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,
                                                   Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,
                                                   Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Id IN: ec2Ids WITH SECURITY_ENFORCED];

        String ec2Heading = 'EC2Id,Name,CRRId,ADOFundigType,ADONotes,ApplicationComponent,AWSAccounts,AWSAvailabilityZone,AWSRegion,Tenancy,InstanceType,InstanceQuantity,Platform,ResourceStatus,Environment'+'\n';
        String ec2FileContent ='';
        for (OCEAN_Ec2Instance__c ec2 : ec2Resources){
            ec2FileContent += ec2.Id+ ',' + ec2.Name+','+ec2.Ocean_Request_Id__c+','+ec2.ADO_FUNDING_TYPE__c+','+ec2.ADO_Notes__c+','+ec2.Application_Component__c+
                            ','+ec2.AWS_Accounts__c+','+ec2.AWS_Availability_Zone__c+','+ec2.AWS_Region__c+','+ec2.Tenancy__c+','+ec2.EC2_Instance_Type__c+','+
                            ec2.Instance_Quantity__c+','+ec2.Platform__c+','+ec2.Resource_Status__c+','+ec2.Environment__c; 
            ec2FileContent += '\n';
        }

        List<ContentVersion> ec2File = [SELECT Id,Title,versiondata,contentDocumentId FROM ContentVersion WHERE Title = 'ModifiedEC2Records' LIMIT 1];
        if(ec2File.size() > 0) {
            ContentVersion cv = new ContentVersion();
            cv.title = 'ModifiedEC2Records';
            String combinedString = EncodingUtil.convertToHex(ec2File[0].versiondata)+EncodingUtil.convertToHex(Blob.valueOf(ec2FileContent));
            cv.versiondata = EncodingUtil.convertFromHex(combinedString);
            cv.pathonclient = 'ModifiedEC2Records.csv';
            insert cv;
            ContentDocument cd =[SELECT Id FROM ContentDocument WHERE Id =: ec2File[0].contentDocumentId];
            delete cd;
        } else {
            ContentVersion cv = new ContentVersion();
            cv.title = 'ModifiedEC2Records';
            cv.versiondata = Blob.valueOf(ec2Heading+ec2FileContent);
            cv.pathonclient = 'ModifiedEC2Records.csv';
            insert cv;

        }
        
    }

    public static void createCRRCSVFile(List<Id> reqIds){
        List<Ocean_Request__c> reqList = [SELECT Id,Name,AWSInstances__c,Assumptions__c,CRMT_Request_Status__c,Request_Status__c,
                                          Review_Outcome__c FROM Ocean_Request__c WHERE Id IN: reqIds];

        String reqFileHeading = 'Id,Name,AWSInstances,Assumptions,RequestStatus,CRMTRequestStatus,ReviewOutcome'+'\n';
        String reqFileContent = '';

        for(Ocean_Request__c req : reqList){
            reqFileContent += req.Id+','+req.Name+','+req.AWSInstances__c+','+req.Assumptions__c+','+req.Request_Status__c+','+
                              req.CRMT_Request_Status__c+','+req.Review_Outcome__c;
            reqFileContent += '\n';
        }

        List<ContentVersion> reqFile = [SELECT Id,Title,versiondata,contentDocumentId FROM ContentVersion WHERE Title = 'ApprovedCloudResourceRequests' LIMIT 1];
        if(reqFile.size() > 0) {
            ContentVersion cv = new ContentVersion();
            cv.title = 'ApprovedCloudResourceRequests';
            String combinedString = EncodingUtil.convertToHex(reqFile[0].versiondata)+EncodingUtil.convertToHex(Blob.valueOf(reqFileContent));
            cv.versiondata = EncodingUtil.convertFromHex(combinedString);
            cv.pathonclient = 'ApprovedCloudResourceRequests.csv';
            insert cv;
            ContentDocument cd =[SELECT Id FROM ContentDocument WHERE Id =: reqFile[0].contentDocumentId];
            delete cd;
        } else {
            ContentVersion cv = new ContentVersion();
            cv.title = 'ApprovedCloudResourceRequests';
            cv.versiondata = Blob.valueOf(reqFileHeading+reqFileContent);
            cv.pathonclient = 'ApprovedCloudResourceRequests.csv';
            insert cv;
        }
    }
}
