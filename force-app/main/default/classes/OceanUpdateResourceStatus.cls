/*** This class updates the status of all the child AWS Resource's status to 'Under Review' when the
Cloud Request Status is 'CRMT Review' and to 'Approved' when 'Attestation Requested'. ***/

public with sharing class OceanUpdateResourceStatus {
    static final String CRMT_REVIEW = 'CRMT Review';
    static final String UNDER_REVIEW = 'Under Review';
    static final String ATTESTATION = 'Attestation Requested';
    static final String APPROVED = 'Approved';
    static final String CRMT_INTAKE_REVIEW = 'CRMT Intake Review';
    static final String NEWSTATUS = 'New';

    public void updateResourceStatus(List<Ocean_Request__c> newRequest) {
     // Update all the child AWS resources status to 'Under Review' & 'Approved' //   
        List<Id> reqIds = new List<Id>();
        String[] awsInstances ;
        for(Ocean_Request__c oc : newRequest){
            reqIds.add(oc.Id);
        }

        for(Ocean_Request__c oc : newRequest){
            awsInstances = oc.AWSInstances__c.split(';');
          if(oc.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW || oc.CRMT_Request_Status__c == ATTESTATION)  {
            if(awsInstances.contains('EC2')){
                updateEC2ResourceStatus(reqIds);
            }
            if(awsInstances.contains('EBS')){
                updateEBSResourceStatus(reqIds);
            }
            if(awsInstances.contains('EFS')){
                updateEFSResourceStatus(reqIds);
            }
            if(awsInstances.contains('ELB')){
                updateELBResourceStatus(reqIds);
            }
            if(awsInstances.contains('EMR')){
                updateEMRResourceStatus(reqIds);
            }
            if(awsInstances.contains('Lambda')){
                updateLambdaResourceStatus(reqIds);
            }
            if(awsInstances.contains('QuickSight')){
                updateQsightResourceStatus(reqIds);
            }
            if(awsInstances.contains('RDS')){
                updateRDSResourceStatus(reqIds);
            }
            if(awsInstances.contains('RDS Backup Storage')){
                updateRDSBkupResourceStatus(reqIds);
            }
            if(awsInstances.contains('DynamoDB')){
                updateDynamoResourceStatus(reqIds);
            }
            if(awsInstances.contains('S3')){
                updateS3ResourceStatus(reqIds);
            }
            if(awsInstances.contains('VPC')){
                updateVPCResourceStatus(reqIds);
            }
            if(awsInstances.contains('Redshift')){
                updateRSResourceStatus(reqIds);
            }
            if(awsInstances.contains('WorkSpaces')){
                updateWSResourceStatus(reqIds);
            }
            if(awsInstances.contains('Data Transfer')){
                updateDTResourceStatus(reqIds);
            }
            if(awsInstances.contains('Other Service')){
                updateOtherResourceStatus(reqIds);
            }
          }
        }
       
    }

    public Pagereference updateEC2ResourceStatus(List<Id> reqIds){
        List<OCEAN_Ec2Instance__c> ec2List = new List<OCEAN_Ec2Instance__c>();       
                ec2List = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c IN: reqIds
        WITH SECURITY_ENFORCED];
        
        for(OCEAN_Ec2Instance__c ec2 : ec2List){
            if(ec2.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && ec2.Resource_Status__c == NEWSTATUS) {               
                        ec2.Resource_Status__c = UNDER_REVIEW;                                   
            } 
            if(ec2.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (ec2.Resource_Status__c == NEWSTATUS || ec2.Resource_Status__c == UNDER_REVIEW )) {               
                        ec2.Resource_Status__c = APPROVED;               
            }    
        } 
        if(ec2List.size() > 0 && (Schema.sObjectType.OCEAN_Ec2Instance__c.fields.Resource_Status__c.isUpdateable())){
            update ec2List;
        }
        return null;      
    }

    public Pagereference updateEBSResourceStatus(List<Id> reqIds){
        List<Ocean_Ebs_Storage__c> ebsList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c IN: reqIds
        WITH SECURITY_ENFORCED];
        
        for(Ocean_Ebs_Storage__c ebs : ebsList){
            if(ebs.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && ebs.Resource_Status__c == NEWSTATUS) {
                ebs.Resource_Status__c = UNDER_REVIEW;                
            }
            if(ebs.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (ebs.Resource_Status__c == NEWSTATUS || ebs.Resource_Status__c == UNDER_REVIEW )) {
                ebs.Resource_Status__c = APPROVED;
            }
        }
        if(ebsList.size() > 0 && (Schema.sObjectType.Ocean_Ebs_Storage__c.fields.Resource_Status__c.isUpdateable())){
            update ebsList;
        }
        return null;
    }

    public Pagereference updateEFSResourceStatus(List<Id> reqIds){
        List<Ocean_EFS_Request__c> efsList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];

        for(Ocean_EFS_Request__c efs : efsList){
            if(efs.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && efs.Resource_Status__c == NEWSTATUS) {    
                        efs.Resource_Status__c = UNDER_REVIEW;
            }
            if(efs.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (efs.Resource_Status__c == NEWSTATUS || efs.Resource_Status__c == UNDER_REVIEW )) {    
                        efs.Resource_Status__c = APPROVED;
            }
        }
        if(efsList.size() > 0 && (Schema.sObjectType.Ocean_EFS_Request__c.fields.Resource_Status__c.isUpdateable())){
            update efsList;
        }        
        return null;
    }

    public Pagereference updateELBResourceStatus(List<Id> reqIds){
        List<Ocean_ELB_Request__c> elbList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];

        for(Ocean_ELB_Request__c elb : elbList){
            if(elb.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && elb.Resource_Status__c == NEWSTATUS) {    
                        elb.Resource_Status__c = UNDER_REVIEW;
            }
            if(elb.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (elb.Resource_Status__c == NEWSTATUS || elb.Resource_Status__c == UNDER_REVIEW )) {    
                        elb.Resource_Status__c = APPROVED;
            }
        }
        if(elbList.size() > 0 && (Schema.sObjectType.Ocean_ELB_Request__c.fields.Resource_Status__c.isUpdateable())){
            update elbList;
        }  
        return null;
    }

    public Pagereference updateEMRResourceStatus(List<Id> reqIds){
        List<Ocean_EMR_Request__c> emrList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_EMR_Request__c emr : emrList){
            if(emr.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && emr.Resource_Status__c == NEWSTATUS) {
                    emr.Resource_Status__c = UNDER_REVIEW;
            }
            if(emr.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (emr.Resource_Status__c == NEWSTATUS || emr.Resource_Status__c == UNDER_REVIEW )) {    
                    emr.Resource_Status__c = APPROVED;
            }
        }
        if(emrList.size() > 0 && (Schema.sObjectType.Ocean_EMR_Request__c.fields.Resource_Status__c.isUpdateable())){
            update emrList;
        }  
        return null;
    }

    public Pagereference updateLambdaResourceStatus(List<Id> reqIds){
        List<Ocean_Lambda__c> lambdaList = [SELECT Resource_Status__c, Ocean_Request_Id__c, Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_Lambda__c lambda : lambdaList){
            if(lambda.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && lambda.Resource_Status__c == NEWSTATUS) {
                    lambda.Resource_Status__c = UNDER_REVIEW;
            }
            if(lambda.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (lambda.Resource_Status__c == NEWSTATUS || lambda.Resource_Status__c == UNDER_REVIEW )) {    
                    lambda.Resource_Status__c = APPROVED;
            }
        }
        if(lambdaList.size() > 0 && (Schema.sObjectType.Ocean_Lambda__c.fields.Resource_Status__c.isUpdateable())){
            update lambdaList;
        }  
        return null;
    }

    public Pagereference updateQsightResourceStatus(List<Id> reqIds){
        List<Ocean_QuickSight_Request__c> qsiteList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_QuickSight_Request__c qs : qsiteList){
            if(qs.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && qs.Resource_Status__c == NEWSTATUS) {    
                    qs.Resource_Status__c = UNDER_REVIEW;
            }
            if(qs.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (qs.Resource_Status__c == NEWSTATUS || qs.Resource_Status__c == UNDER_REVIEW )) {    
                    qs.Resource_Status__c = APPROVED;
            }
        }
        if(qsiteList.size() > 0 && (Schema.sObjectType.Ocean_QuickSight_Request__c.fields.Resource_Status__c.isUpdateable())){
            update qsiteList;
        } 
        return null;
    }

    public Pagereference updateRDSResourceStatus(List<Id> reqIds){
        List<Ocean_RDS_Request__c> rdsList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_RDS_Request__c rds : rdsList){
            if(rds.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && rds.Resource_Status__c == NEWSTATUS) {
                    rds.Resource_Status__c = UNDER_REVIEW;
            }
            if(rds.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (rds.Resource_Status__c == NEWSTATUS || rds.Resource_Status__c == UNDER_REVIEW )) {    
                    rds.Resource_Status__c = APPROVED;
            }
        }
        if(rdsList.size() > 0 && (Schema.sObjectType.Ocean_RDS_Request__c.fields.Resource_Status__c.isUpdateable())){
            update rdsList;
        } 
        return null;
    }

    public Pagereference updateRDSBkupResourceStatus(List<Id> reqIds){
        List<Ocean_RDS_Backup_Request__c> rdsBkupList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_RDS_Backup_Request__c rdsbk : rdsBkupList){
            if(rdsbk.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && rdsbk.Resource_Status__c == NEWSTATUS) {
                    rdsbk.Resource_Status__c = UNDER_REVIEW;
            }
            if(rdsbk.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (rdsbk.Resource_Status__c == NEWSTATUS || rdsbk.Resource_Status__c == UNDER_REVIEW )) {    
                    rdsbk.Resource_Status__c = APPROVED;
            }
        }
        if(rdsBkupList.size() > 0 && (Schema.sObjectType.Ocean_RDS_Backup_Request__c.fields.Resource_Status__c.isUpdateable())){
            update rdsBkupList;
        } 
        return null;
    }

    public Pagereference updateDynamoResourceStatus(List<Id> reqIds){
        List<Ocean_DynamoDB_Request__c> dynamoList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_DynamoDB_Request__c dynamo : dynamoList){
            if(dynamo.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && dynamo.Resource_Status__c == NEWSTATUS) {
                    dynamo.Resource_Status__c = UNDER_REVIEW;
            }
            if(dynamo.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (dynamo.Resource_Status__c == NEWSTATUS || dynamo.Resource_Status__c == UNDER_REVIEW )) {
                    dynamo.Resource_Status__c = APPROVED;
            }
        }
        if(dynamoList.size() > 0 && (Schema.sObjectType.Ocean_DynamoDB_Request__c.fields.Resource_Status__c.isUpdateable())){
            update dynamoList;
        } 
        return null;
    }

    public Pagereference updateS3ResourceStatus(List<Id> reqIds){
        List<Ocean_S3_Request__c> s3List = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        for(Ocean_S3_Request__c s3 : s3List){
            if(s3.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && s3.Resource_Status__c == NEWSTATUS) {
                    s3.Resource_Status__c = UNDER_REVIEW;
            }
            if(s3.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (s3.Resource_Status__c == NEWSTATUS || s3.Resource_Status__c == UNDER_REVIEW )) {
                    s3.Resource_Status__c = APPROVED;
            }
        }
        if(s3List.size() > 0 && (Schema.sObjectType.Ocean_S3_Request__c.fields.Resource_Status__c.isUpdateable())){
            update s3List;
        } 
        return null;
    }

    public Pagereference updateVPCResourceStatus(List<Id> reqIds){
        List<Ocean_Vpc_Request__c> vpcList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_Vpc_Request__c vpc : vpcList){
            if(vpc.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && vpc.Resource_Status__c == NEWSTATUS) {
                    vpc.Resource_Status__c = UNDER_REVIEW;
            }
            if(vpc.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (vpc.Resource_Status__c == NEWSTATUS || vpc.Resource_Status__c == UNDER_REVIEW )) {
                    vpc.Resource_Status__c = APPROVED;
            }
        }
        if(vpcList.size() > 0 && (Schema.sObjectType.Ocean_Vpc_Request__c.fields.Resource_Status__c.isUpdateable())){
            update vpcList;
        } 
        return null;
    }

    public Pagereference updateRSResourceStatus(List<Id> reqIds){
        List<Ocean_Redshift_Request__c> redshiftList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_Redshift_Request__c rs : redshiftList){
            if(rs.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && rs.Resource_Status__c == NEWSTATUS) {
                    rs.Resource_Status__c = UNDER_REVIEW;
            }
            if(rs.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (rs.Resource_Status__c == NEWSTATUS || rs.Resource_Status__c == UNDER_REVIEW )) {
                    rs.Resource_Status__c = APPROVED;
            }
        }
        if(redshiftList.size() > 0 && (Schema.sObjectType.Ocean_Redshift_Request__c.fields.Resource_Status__c.isUpdateable())){
            update redshiftList;
        } 
        return null;
    }

    public Pagereference updateWSResourceStatus(List<Id> reqIds){
        List<Ocean_Workspaces_Request__c> workspaceList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
       
        for(Ocean_Workspaces_Request__c ws : workspaceList){
            if(ws.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && ws.Resource_Status__c == NEWSTATUS) {
                    ws.Resource_Status__c = UNDER_REVIEW;
            }
            if(ws.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (ws.Resource_Status__c == NEWSTATUS || ws.Resource_Status__c == UNDER_REVIEW )) {
                    ws.Resource_Status__c = APPROVED;
            }
        }
        if(workspaceList.size() > 0 && (Schema.sObjectType.Ocean_Workspaces_Request__c.fields.Resource_Status__c.isUpdateable())){
            update workspaceList;
        } 
        return null;
    }

    public Pagereference updateDTResourceStatus(List<Id> reqIds){
        List<Ocean_DataTransfer_Request__c> dataTransferList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_DataTransfer_Request__c dt : dataTransferList){
            if(dt.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && dt.Resource_Status__c == NEWSTATUS) {
                    dt.Resource_Status__c = UNDER_REVIEW;
            }
            if(dt.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (dt.Resource_Status__c == NEWSTATUS || dt.Resource_Status__c == UNDER_REVIEW )) {
                    dt.Resource_Status__c = APPROVED;
            }
        }
        if(dataTransferList.size() > 0 && (Schema.sObjectType.Ocean_DataTransfer_Request__c.fields.Resource_Status__c.isUpdateable())){
            update dataTransferList;
        } 
        return null;
    }

     public Pagereference updateOtherResourceStatus(List<Id> reqIds){
        List<Ocean_Other_Request__c> otherList = [SELECT Resource_Status__c, Ocean_Request_Id__c,Ocean_Request_Id__r.Request_Status__c,
        Ocean_Request_Id__r.CRMT_Request_Status__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c IN: reqIds WITH SECURITY_ENFORCED];
        
        for(Ocean_Other_Request__c other : otherList){
            if(other.Ocean_Request_Id__r.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW && other.Resource_Status__c == NEWSTATUS) {
                    other.Resource_Status__c = UNDER_REVIEW;
            }
            if(other.Ocean_Request_Id__r.CRMT_Request_Status__c == ATTESTATION && (other.Resource_Status__c == NEWSTATUS || other.Resource_Status__c == UNDER_REVIEW )) {
                    other.Resource_Status__c = APPROVED;
            }
        }
        if(otherList.size() > 0 && (Schema.sObjectType.Ocean_Other_Request__c.fields.Resource_Status__c.isUpdateable())){
            update otherList;
        } 
        return null;
    }

}