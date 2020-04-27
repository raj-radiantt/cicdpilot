public with sharing class ApprovedEC2ResourcesHelper {

    public static void updateReviewOutcome(Id requestId){
        List<Ocean_Request__c> reqList = [SELECT Id,Name,ApplicationName__c,Request_Status__c FROM Ocean_Request__c WHERE Id =: requestId WITH SECURITY_ENFORCED LIMIT 1 ];
        String appId = reqList[0].ApplicationName__c;
        List<Ocean_Request__c> reqApprovedList = [SELECT Id,Name,ApplicationName__c,Request_Status__c FROM Ocean_Request__c WHERE Id !=: requestId AND ApplicationName__c =:appId
                                                  AND Request_Status__c = 'Request Complete' WITH SECURITY_ENFORCED];
        system.debug('reqApprovedList:::'+reqApprovedList);
        for(Ocean_Request__c req : reqApprovedList){
            req.Review_Outcome__c = 'Closed';
        }
        update reqApprovedList;
    }
    
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
                                                   AWS_Accounts__c,AWS_Accounts__r.Name,AWS_Region__c,Calculated_Cost__c,Cloud_Resource_Projection__c,Tenancy__c,EC2_Instance_Type__c,
                                                   Instance_Quantity__c,PerInstanceUptimePerDay__c,PerInstanceUptimePerMonth__c,Per_Instance_Running_Months_in_Remaining__c,
                                                   Platform__c,Resource_Status__c,Environment__c FROM OCEAN_Ec2Instance__c WHERE Id IN: ec2Ids WITH SECURITY_ENFORCED];

        String ec2Heading = 'EC2Id\tName\tCRRId\tADOFundigType\tADONotes\tApplicationComponent\tAWSAccounts\tAWSAccountsName\tAWSAvailabilityZone\tAWSRegion\tTenancy\tInstanceType\tInstanceRunningHoursPerDay\tInstanceRunningDaysPerMonth\tNumberofMonthsRequested\tInstanceQuantity\tPlatform\tResourceStatus\tEnvironment\tEstimatedCost'+'\n';
        String ec2FileContent ='';
        for (OCEAN_Ec2Instance__c ec2 : ec2Resources){
            ec2FileContent += ec2.Id+ '\t' + ec2.Name+'\t'+ec2.Ocean_Request_Id__c+'\t'+ ec2.ADO_FUNDING_TYPE__c+'\t'+ec2.ADO_Notes__c+'\t'+ec2.Application_Component__c+
                            '\t'+ec2.AWS_Accounts__c+'\t'+ec2.AWS_Accounts__r.Name+'\t'+ec2.AWS_Availability_Zone__c+'\t'+ec2.AWS_Region__c+'\t'+ec2.Tenancy__c+'\t'+ec2.EC2_Instance_Type__c+'\t'+
                            ec2.PerInstanceUptimePerDay__c+'\t'+ec2.PerInstanceUptimePerMonth__c+'\t'+ec2.Per_Instance_Running_Months_in_Remaining__c+'\t'+
                            ec2.Instance_Quantity__c+'\t'+ec2.Platform__c+'\t'+ec2.Resource_Status__c+'\t'+ec2.Environment__c+'\t'+ec2.Calculated_Cost__c; 
            ec2FileContent += '\n';
        }

        Ocean_Report__c oceanR = [SELECT Id,Created_Date__c FROM Ocean_Report__c LIMIT 1];
        List<Id> lstConDocs = new List<Id>();
        List<contentversion> cvList = new List<contentversion>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:oceanR.id]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if(!lstConDocs.isEmpty()) {
            cvList = [SELECT Id, Title, ContentDocumentId,versiondata FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs AND Title = 'ModifiedEC2Records' LIMIT 1];
        }

        if(!cvList.isEmpty()) {
            ContentVersion cv = new ContentVersion();
            cv.title = 'ModifiedEC2Records';
            String combinedString = EncodingUtil.convertToHex(cvList[0].versiondata)+EncodingUtil.convertToHex(Blob.valueOf(ec2FileContent));
            cv.versiondata = EncodingUtil.convertFromHex(combinedString);
            cv.pathonclient = 'ModifiedEC2Records.tsv';
            insert cv;
            Id cdId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            ContentDocumentLink cdLnk = new ContentDocumentLink();
            cdLnk.ContentDocumentId = cdId;
            cdLnk.LinkedEntityId = oceanR.id;
            cdLnk.ShareType = 'I';
            cdLnk.Visibility = 'AllUsers';
            insert cdLnk;
            ContentDocument cd =[SELECT Id FROM ContentDocument WHERE Id =: cvList[0].contentDocumentId];
            delete cd;
        } else{
            ContentVersion cv = new ContentVersion();
            cv.title = 'ModifiedEC2Records';
            cv.versiondata = Blob.valueOf(ec2Heading+ec2FileContent);
            cv.pathonclient = 'ModifiedEC2Records.tsv';
            insert cv; 
            Id cdId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            ContentDocumentLink cdLnk = new ContentDocumentLink();
            cdLnk.ContentDocumentId = cdId;
            cdLnk.LinkedEntityId = oceanR.id;
            cdLnk.ShareType = 'I';
            cdLnk.Visibility = 'AllUsers';
            insert cdLnk;
        }
    }

    public static void createCRRCSVFile(List<Id> reqIds){
        List<Ocean_Request__c> reqList = [SELECT Id,Name,AWSInstances__c,Assumptions__c,CRMT_Request_Status__c,Request_Status__c,
                                          Review_Outcome__c,ApplicationName__r.Name,ApplicationName__r.Project_Acronym__r.Name,Ec2_Total_Cost__c,Total_Cost__c FROM Ocean_Request__c WHERE Id IN: reqIds];

        String reqFileHeading = 'Id\tName\tAWSInstances\tAssumptions\tApplicationName\tProjectName\tRequestStatus\tCRMTRequestStatus\tReviewOutcome\tEC2Cost\tTotalCost'+'\n';
        String reqFileContent = '';

        for(Ocean_Request__c req : reqList){
            reqFileContent += req.Id+'\t'+req.Name+'\t'+req.AWSInstances__c+'\t'+req.Assumptions__c+'\t'+req.ApplicationName__r.Name+'\t'+
            req.ApplicationName__r.Project_Acronym__r.Name+'\t'+req.Request_Status__c+'\t'+
                              req.CRMT_Request_Status__c+'\t'+req.Review_Outcome__c+'\t'+req.Ec2_Total_Cost__c+'\t'+req.Total_Cost__c;
            reqFileContent += '\n';
        }

        Ocean_Report__c oceanR = [SELECT Id,Created_Date__c FROM Ocean_Report__c LIMIT 1];
        List<Id> lstConDocs = new List<Id>();
        List<contentversion> cvList = new List<contentversion>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:oceanR.id]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if(!lstConDocs.isEmpty()) {
            cvList = [SELECT Id, Title, ContentDocumentId,versiondata FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs AND Title = 'ApprovedCloudResourceRequests' LIMIT 1];
        }

        if(!cvList.isEmpty()) {
            ContentVersion cv = new ContentVersion();
            cv.title = 'ApprovedCloudResourceRequests';
            String combinedString = EncodingUtil.convertToHex(cvList[0].versiondata)+EncodingUtil.convertToHex(Blob.valueOf(reqFileContent));
            cv.versiondata = EncodingUtil.convertFromHex(combinedString);
            cv.pathonclient = 'ApprovedCloudResourceRequests.csv';
            insert cv;
            Id cdId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            ContentDocumentLink cdLnk = new ContentDocumentLink();
            cdLnk.ContentDocumentId = cdId;
            cdLnk.LinkedEntityId = oceanR.id;
            cdLnk.ShareType = 'I';
            cdLnk.Visibility = 'AllUsers';
            insert cdLnk;
            ContentDocument cd =[SELECT Id FROM ContentDocument WHERE Id =: cvList[0].contentDocumentId];
            delete cd;
        } else{
            ContentVersion cv = new ContentVersion();
            cv.title = 'ApprovedCloudResourceRequests';
            cv.versiondata = Blob.valueOf(reqFileHeading+reqFileContent);
            cv.pathonclient = 'ApprovedCloudResourceRequests.tsv';
            insert cv; 
            Id cdId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            ContentDocumentLink cdLnk = new ContentDocumentLink();
            cdLnk.ContentDocumentId = cdId;
            cdLnk.LinkedEntityId = oceanR.id;
            cdLnk.ShareType = 'I';
            cdLnk.Visibility = 'AllUsers';
            insert cdLnk;
        }
     }
}
