/*** This class updates the status of all the child AWS Resource's status to 'Under Review' when the
Cloud Request Status is 'CRMT Review' and to 'Approved' when 'Attestation Requested'. ***/

public with sharing class OceanUpdateResourceStatus {
    static final String CRMT_REVIEW = 'CRMT Review';
    static final String UNDER_REVIEW = 'Under Review';
    static final String ATTESTATION = 'Attestation Requested';
    static final String APPROVED = 'Approved';
    static final String CRMT_INTAKE_REVIEW = 'CRMT Intake Review';
    public OceanUpdateResourceStatus() {}

    public Pagereference updateEC2ResourceStatus(Ocean_Request__c oceanReq){
        List<OCEAN_Ec2Instance__c> EC2List = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        if(EC2List.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(OCEAN_Ec2Instance__c ec2 : EC2List){
                    if (!Schema.sObjectType.OCEAN_Ec2Instance__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        ec2.Resource_Status__c = UNDER_REVIEW;
                        update ec2;
                    }                  
                }  
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(OCEAN_Ec2Instance__c ec2 : EC2List){
                    if (!Schema.sObjectType.OCEAN_Ec2Instance__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        ec2.Resource_Status__c = APPROVED;
                        update ec2;
                } 
            }    
        }    
        return null;      
    }

    public Pagereference updateEBSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Ebs_Storage__c> EBSList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(EBSList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Ebs_Storage__c ebs : EBSList){
                    if (!Schema.sObjectType.Ocean_Ebs_Storage__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        ebs.Resource_Status__c = UNDER_REVIEW;
                        update ebs;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Ebs_Storage__c ebs : EBSList){
                    if (!Schema.sObjectType.Ocean_Ebs_Storage__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        ebs.Resource_Status__c = APPROVED;
                        update ebs;
                }
            }
        }
        return null;
    }

    public Pagereference updateEFSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_EFS_Request__c> EFSList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(EFSList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {    
                for(Ocean_EFS_Request__c efs : EFSList){
                    if (!Schema.sObjectType.Ocean_EFS_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        efs.Resource_Status__c = UNDER_REVIEW;
                        update efs;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_EFS_Request__c efs : EFSList){
                    if (!Schema.sObjectType.Ocean_EFS_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        efs.Resource_Status__c = APPROVED;
                        update efs;
                }
            }
        }
        return null;
    }

    public Pagereference updateELBResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_ELB_Request__c> ELBList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(ELBList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {    
                for(Ocean_ELB_Request__c elb : ELBList){
                    if (!Schema.sObjectType.Ocean_ELB_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        elb.Resource_Status__c = UNDER_REVIEW;
                        update elb;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_ELB_Request__c elb : ELBList){
                    if (!Schema.sObjectType.Ocean_ELB_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                        elb.Resource_Status__c = APPROVED;
                        update elb;
                }
            }
        }
        return null;
    }

    public Pagereference updateEMRResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_EMR_Request__c> EMRList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(EMRList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_EMR_Request__c emr : EMRList){
                    if (!Schema.sObjectType.Ocean_EMR_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    emr.Resource_Status__c = UNDER_REVIEW;
                    update emr;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_EMR_Request__c emr : EMRList){
                    if (!Schema.sObjectType.Ocean_EMR_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    emr.Resource_Status__c = APPROVED;
                    update emr;
                }
            }
        }
        return null;
    }

    public Pagereference updateLambdaResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Lambda__c> lambdaList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(lambdaList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Lambda__c lambda : lambdaList){
                    if (!Schema.sObjectType.Ocean_Lambda__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    lambda.Resource_Status__c = UNDER_REVIEW;
                    update lambda;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_Lambda__c lambda : lambdaList){
                    if (!Schema.sObjectType.Ocean_Lambda__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    lambda.Resource_Status__c = APPROVED;
                    update lambda;
                }
            }
        }
        return null;
    }

    public Pagereference updateQsightResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_QuickSight_Request__c> qsiteList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(qsiteList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {    
                for(Ocean_QuickSight_Request__c qs : qsiteList){
                    if (!Schema.sObjectType.Ocean_QuickSight_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    qs.Resource_Status__c = UNDER_REVIEW;
                    update qs;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_QuickSight_Request__c qs : qsiteList){
                    if (!Schema.sObjectType.Ocean_QuickSight_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    qs.Resource_Status__c = APPROVED;
                    update qs;
                }
            }
        }
        return null;
    }

    public Pagereference updateRDSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_RDS_Request__c> RDSList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(RDSList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_RDS_Request__c rds : RDSList){
                    if (!Schema.sObjectType.Ocean_RDS_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    rds.Resource_Status__c = UNDER_REVIEW;
                    update rds;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_RDS_Request__c rds : RDSList){
                    if (!Schema.sObjectType.Ocean_RDS_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    rds.Resource_Status__c = APPROVED;
                    update rds;
                }
            }
        }
        return null;
    }

    public Pagereference updateRDSBkupResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_RDS_Backup_Request__c> RDSBkupList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(RDSBkupList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_RDS_Backup_Request__c rdsbk : RDSBkupList){
                    if (!Schema.sObjectType.Ocean_RDS_Backup_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    rdsbk.Resource_Status__c = UNDER_REVIEW;
                    update rdsbk;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_RDS_Backup_Request__c rdsbk : RDSBkupList){
                    if (!Schema.sObjectType.Ocean_RDS_Backup_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    rdsbk.Resource_Status__c = APPROVED;
                    update rdsbk;
                }
            }
        }
        return null;
    }

    public Pagereference updateDynamoResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_DynamoDB_Request__c> dynamoList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(dynamoList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_DynamoDB_Request__c dynamo : dynamoList){
                    if (!Schema.sObjectType.Ocean_DynamoDB_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    dynamo.Resource_Status__c = UNDER_REVIEW;
                    update dynamo;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_DynamoDB_Request__c dynamo : dynamoList){
                    if (!Schema.sObjectType.Ocean_DynamoDB_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    dynamo.Resource_Status__c = APPROVED;
                    update dynamo;
                }
            }
        }
        return null;
    }

    public Pagereference updateS3ResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_S3_Request__c> s3List = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(s3List.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_S3_Request__c s3 : s3List){
                     if (!Schema.sObjectType.Ocean_S3_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    s3.Resource_Status__c = UNDER_REVIEW;
                    update s3;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_S3_Request__c s3 : s3List){
                    if (!Schema.sObjectType.Ocean_S3_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    s3.Resource_Status__c = APPROVED;
                    update s3;
                }
            }
        }
        return null;
    }

    public Pagereference updateVPCResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Vpc_Request__c> vpcList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(vpcList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Vpc_Request__c vpc : vpcList){
                    if (!Schema.sObjectType.Ocean_Vpc_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    vpc.Resource_Status__c = UNDER_REVIEW;
                    update vpc;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Vpc_Request__c vpc : vpcList){
                    if (!Schema.sObjectType.Ocean_Vpc_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    vpc.Resource_Status__c = APPROVED;
                    update vpc;
                }
            }
        }
        return null;
    }

    public Pagereference updateRSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Redshift_Request__c> redshiftList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(redshiftList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Redshift_Request__c rs : redshiftList){
                    if (!Schema.sObjectType.Ocean_Redshift_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    rs.Resource_Status__c = UNDER_REVIEW;
                    update rs;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Redshift_Request__c rs : redshiftList){
                    if (!Schema.sObjectType.Ocean_Redshift_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    rs.Resource_Status__c = APPROVED;
                    update rs;
                }
            }
        }
        return null;
    }

    public Pagereference updateWSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Workspaces_Request__c> workspaceList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
       
        if(workspaceList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Workspaces_Request__c ws : workspaceList){
                    if (!Schema.sObjectType.Ocean_Workspaces_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    ws.Resource_Status__c = UNDER_REVIEW;
                    update ws;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Workspaces_Request__c ws : workspaceList){
                    if (!Schema.sObjectType.Ocean_Workspaces_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    ws.Resource_Status__c = APPROVED;
                    update ws;
                }
            }
        }
        return null;
    }

    public Pagereference updateDTResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_DataTransfer_Request__c> dataTransferList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(dataTransferList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_DataTransfer_Request__c dt : dataTransferList){
                    if (!Schema.sObjectType.Ocean_DataTransfer_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    dt.Resource_Status__c = UNDER_REVIEW;
                    update dt;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_DataTransfer_Request__c dt : dataTransferList){
                    if (!Schema.sObjectType.Ocean_DataTransfer_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    dt.Resource_Status__c = APPROVED;
                    update dt;
                }
            }
        }
        return null;
    }

     public Pagereference updateOtherResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Other_Request__c> otherList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        
        if(otherList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Other_Request__c other : otherList){
                     if (!Schema.sObjectType.Ocean_Other_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    other.Resource_Status__c = UNDER_REVIEW;
                    update other;
                }
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Other_Request__c other : otherList){
                     if (!Schema.sObjectType.Ocean_Other_Request__c.fields.Resource_Status__c.isUpdateable()){
                        return null;
                    }
                    other.Resource_Status__c = APPROVED;
                     update other;
                }
            }
        }
        return null;
    }

}
