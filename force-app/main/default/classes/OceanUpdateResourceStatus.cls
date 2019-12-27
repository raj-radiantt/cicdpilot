/*** This class updates the status of all the child AWS Resource's status to 'Under Review' when the
Cloud Request Status is 'CRMT Review' and to 'Approved' when 'Attestation Requested'. ***/

public with sharing class OceanUpdateResourceStatus {
    static final String CRMT_REVIEW = 'CRMT Review';
    static final String UNDER_REVIEW = 'Under Review';
    static final String ATTESTATION = 'Attestation Requested';
    static final String APPROVED = 'Approved';
    static final String CRMT_INTAKE_REVIEW = 'CRMT Intake Review';
    public OceanUpdateResourceStatus() {}

    public void updateEC2ResourceStatus(Ocean_Request__c oceanReq){
        List<OCEAN_Ec2Instance__c> EC2List = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM OCEAN_Ec2Instance__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<OCEAN_Ec2Instance__c> newEC2List = new List<OCEAN_Ec2Instance__c>();
        if(EC2List.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(OCEAN_Ec2Instance__c ec2 : EC2List){
                    ec2.Resource_Status__c = UNDER_REVIEW;
                    newEC2List.add(ec2);
                }  
                update newEC2List;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(OCEAN_Ec2Instance__c ec2 : EC2List){
                    ec2.Resource_Status__c = APPROVED;
                    newEC2List.add(ec2);
                }     
            }    
        }          
    }

    public void updateEBSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Ebs_Storage__c> EBSList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Ebs_Storage__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_Ebs_Storage__c> newEBSList = new List<Ocean_Ebs_Storage__c>();
        if(EBSList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Ebs_Storage__c ebs : EBSList){
                    ebs.Resource_Status__c = UNDER_REVIEW;
                    newEBSList.add(ebs);
                }
            update newEBSList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Ebs_Storage__c ebs : EBSList){
                    ebs.Resource_Status__c = APPROVED;
                    newEBSList.add(ebs);
                }
            update newEBSList;
            }
        }
    }

    public void updateEFSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_EFS_Request__c> EFSList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_EFS_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_EFS_Request__c> newEFSList = new List<Ocean_EFS_Request__c>();
        if(EFSList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {    
                for(Ocean_EFS_Request__c efs : EFSList){
                    efs.Resource_Status__c = UNDER_REVIEW;
                    newEFSList.add(efs);
                }
            update newEFSList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_EFS_Request__c efs : EFSList){
                    efs.Resource_Status__c = APPROVED;
                    newEFSList.add(efs);
                }
            update newEFSList;
            }
        }
    }

    public void updateELBResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_ELB_Request__c> ELBList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_ELB_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_ELB_Request__c> newELBList = new List<Ocean_ELB_Request__c>();
        if(ELBList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {    
                for(Ocean_ELB_Request__c elb : ELBList){
                    elb.Resource_Status__c = UNDER_REVIEW;
                    newELBList.add(elb);
                }
            update newELBList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_ELB_Request__c elb : ELBList){
                    elb.Resource_Status__c = APPROVED;
                    newELBList.add(elb);
                }
            update newELBList;
            }
        }
    }

    public void updateEMRResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_EMR_Request__c> EMRList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_EMR_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_EMR_Request__c> newEMRList = new List<Ocean_EMR_Request__c>();
        if(EMRList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_EMR_Request__c emr : EMRList){
                    emr.Resource_Status__c = UNDER_REVIEW;
                    newEMRList.add(emr);
                }
            update newEMRList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_EMR_Request__c emr : EMRList){
                    emr.Resource_Status__c = APPROVED;
                    newEMRList.add(emr);
                }
            update newEMRList;
            }
        }
    }

    public void updateLambdaResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Lambda__c> lambdaList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Lambda__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_Lambda__c> newLambdaList = new List<Ocean_Lambda__c>();
        if(lambdaList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Lambda__c lambda : lambdaList){
                    lambda.Resource_Status__c = UNDER_REVIEW;
                    newLambdaList.add(lambda);
                }
            update newLambdaList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_Lambda__c lambda : lambdaList){
                    lambda.Resource_Status__c = APPROVED;
                    newLambdaList.add(lambda);
                }
            update newLambdaList;
            }
        }
    }

    public void updateQsightResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_QuickSight_Request__c> qsiteList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_QuickSight_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_QuickSight_Request__c> newQsiteList = new List<Ocean_QuickSight_Request__c>();
        if(qsiteList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {    
                for(Ocean_QuickSight_Request__c qs : qsiteList){
                    qs.Resource_Status__c = UNDER_REVIEW;
                    newQsiteList.add(qs);
                }
            update newQsiteList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_QuickSight_Request__c qs : qsiteList){
                    qs.Resource_Status__c = APPROVED;
                    newQsiteList.add(qs);
                }
            update newQsiteList;
            }
        }
    }

    public void updateRDSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_RDS_Request__c> RDSList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_RDS_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_RDS_Request__c> newRDSList = new List<Ocean_RDS_Request__c>();
        if(RDSList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_RDS_Request__c rds : RDSList){
                    rds.Resource_Status__c = UNDER_REVIEW;
                    newRDSList.add(rds);
                }
            update newRDSList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_RDS_Request__c rds : RDSList){
                    rds.Resource_Status__c = APPROVED;
                    newRDSList.add(rds);
                }
            update newRDSList;
            }
        }
    }

    public void updateRDSBkupResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_RDS_Backup_Request__c> RDSBkupList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_RDS_Backup_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_RDS_Backup_Request__c> newRDSBkupList = new List<Ocean_RDS_Backup_Request__c>();
        if(RDSBkupList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_RDS_Backup_Request__c rdsbk : RDSBkupList){
                    rdsbk.Resource_Status__c = UNDER_REVIEW;
                    newRDSBkupList.add(rdsbk);
                }
            update newRDSBkupList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {    
                for(Ocean_RDS_Backup_Request__c rdsbk : RDSBkupList){
                    rdsbk.Resource_Status__c = APPROVED;
                    newRDSBkupList.add(rdsbk);
                }
            update newRDSBkupList;
            }
        }
    }

    public void updateDynamoResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_DynamoDB_Request__c> dynamoList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_DynamoDB_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_DynamoDB_Request__c> newDynamoList = new List<Ocean_DynamoDB_Request__c>();
        if(dynamoList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_DynamoDB_Request__c dynamo : dynamoList){
                    dynamo.Resource_Status__c = UNDER_REVIEW;
                    newDynamoList.add(dynamo);
                }
            update newDynamoList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_DynamoDB_Request__c dynamo : dynamoList){
                    dynamo.Resource_Status__c = APPROVED;
                    newDynamoList.add(dynamo);
                }
            update newDynamoList;
            }
        }
    }

    public void updateS3ResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_S3_Request__c> s3List = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_S3_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_S3_Request__c> newS3List = new List<Ocean_S3_Request__c>();
        if(s3List.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_S3_Request__c s3 : s3List){
                    s3.Resource_Status__c = UNDER_REVIEW;
                    newS3List.add(s3);
                }
            update newS3List;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_S3_Request__c s3 : s3List){
                    s3.Resource_Status__c = APPROVED;
                    newS3List.add(s3);
                }
            update newS3List;
            }
        }
    }

    public void updateVPCResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Vpc_Request__c> vpcList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Vpc_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_Vpc_Request__c> newVpcList = new List<Ocean_Vpc_Request__c>();
        if(vpcList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Vpc_Request__c vpc : vpcList){
                    vpc.Resource_Status__c = UNDER_REVIEW;
                    newVpcList.add(vpc);
                }
            update newVpcList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Vpc_Request__c vpc : vpcList){
                    vpc.Resource_Status__c = APPROVED;
                    newVpcList.add(vpc);
                }
            update newVpcList;
            }
        }
    }

    public void updateRSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Redshift_Request__c> redshiftList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Redshift_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_Redshift_Request__c> newRedshiftList = new List<Ocean_Redshift_Request__c>();
        if(redshiftList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Redshift_Request__c rs : redshiftList){
                    rs.Resource_Status__c = UNDER_REVIEW;
                    newRedshiftList.add(rs);
                }
            update newRedshiftList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Redshift_Request__c rs : redshiftList){
                    rs.Resource_Status__c = APPROVED;
                    newRedshiftList.add(rs);
                }
            update newRedshiftList;
            }
        }
    }

    public void updateWSResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Workspaces_Request__c> workspaceList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Workspaces_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_Workspaces_Request__c> newWorkspaceList = new List<Ocean_Workspaces_Request__c>();
        if(workspaceList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Workspaces_Request__c ws : workspaceList){
                    ws.Resource_Status__c = UNDER_REVIEW;
                    newWorkspaceList.add(ws);
                }
            update newWorkspaceList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Workspaces_Request__c ws : workspaceList){
                    ws.Resource_Status__c = APPROVED;
                    newWorkspaceList.add(ws);
                }
            update newWorkspaceList;
            }
        }
    }

    public void updateDTResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_DataTransfer_Request__c> dataTransferList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_DataTransfer_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_DataTransfer_Request__c> newdataTransferList = new List<Ocean_DataTransfer_Request__c>();
        if(dataTransferList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_DataTransfer_Request__c dt : dataTransferList){
                    dt.Resource_Status__c = UNDER_REVIEW;
                    newdataTransferList.add(dt);
                }
            update newdataTransferList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_DataTransfer_Request__c dt : dataTransferList){
                    dt.Resource_Status__c = APPROVED;
                    newdataTransferList.add(dt);
                }
            update newdataTransferList;
            }
        }
    }

     public void updateOtherResourceStatus(Ocean_Request__c oceanReq){
        List<Ocean_Other_Request__c> otherList = [SELECT Id, Name, Resource_Status__c, Ocean_Request_Id__c FROM Ocean_Other_Request__c WHERE Ocean_Request_Id__c =: oceanReq.Id];
        List<Ocean_Other_Request__c> newOtherList = new List<Ocean_Other_Request__c>();
        if(otherList.size() > 0) {
            if(oceanReq.Request_Status__c == CRMT_REVIEW && oceanReq.CRMT_Request_Status__c == CRMT_INTAKE_REVIEW) {
                for(Ocean_Other_Request__c other : otherList){
                    other.Resource_Status__c = UNDER_REVIEW;
                    newOtherList.add(other);
                }
            update newOtherList;
            }
            if(oceanReq.Request_Status__c == ATTESTATION) {
                for(Ocean_Other_Request__c other : otherList){
                    other.Resource_Status__c = APPROVED;
                    newOtherList.add(other);
                }
            update newOtherList;
            }
        }
    }
}
