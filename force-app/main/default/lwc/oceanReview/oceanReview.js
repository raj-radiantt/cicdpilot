/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import getRdsRequests from '@salesforce/apex/OceanController.getRdsRequests';
import getVpcRequests from '@salesforce/apex/OceanController.getVpcRequests';
import getEc2Requests from '@salesforce/apex/OceanController.getEc2Instances';
import getEfsRequests from '@salesforce/apex/OceanController.getEfsRequests';
import getEbsRequests from '@salesforce/apex/OceanController.getEbsStorages';
import getDataTransferRequests from '@salesforce/apex/OceanController.getDataTransferRequests';
import getWorkspaceRequests from '@salesforce/apex/OceanController.getWorkspaceRequests';
import getRedshiftRequests from '@salesforce/apex/OceanController.getRedshiftRequests';
import getOtherRequests from '@salesforce/apex/OceanController.getOtherRequests';
import getS3Requests from '@salesforce/apex/OceanController.getS3Requests';
import getRdsBkupRequests from '@salesforce/apex/OceanController.getRdsBkupRequests';
import getElbRequests from '@salesforce/apex/OceanController.getElbRequests';
import getEmrRequests from '@salesforce/apex/OceanController.getEmrRequests';
import getLambdaRequests from '@salesforce/apex/OceanController.getLambdaRequests';
import getQuickSightRequests from '@salesforce/apex/OceanController.getQuickSightRequests';
import getDdbRequests from '@salesforce/apex/OceanController.getDdbRequests';
export default class OceanReview extends LightningElement {
  @api oceanRequestId;
  @track rdsColumns = [
    { label: 'Status', fieldName: 'Resource_Status__c', type: 'text' },
    { label: 'Request Id', fieldName: 'RDS_Request_Id__c', type: 'text' },
    { label: 'Environment', fieldName: 'Environment__c', type: 'text' },
    { label: 'Region', fieldName: 'AWS_Region__c', type: 'text' },
    {
      label: 'Availability Zone',
      fieldName: 'AWS_Availability_Zone__c',
      type: 'text'
    }
  ];

  @track ec2Requests;
  @track vpcRequests;
  @track ebsRequests;
  @track efsRequests;
  @track rdsRequests;
  @track elbRequests;
  @track quickSightRequests;
  @track lambdaRequests;
  @track emrRequests;
  @track rdsBkupRequests;
  @track s3Requests;
  @track otherRequests;
  @track redshiftRequests;
  @track workspaceRequests;
  @track dataTransferRequests;
  @track dynamodbRequests;

  @track activeSectionMessage = '';
  @track productionItems = {};
  @track implementationItems = {};
  @track lowerEnvItems = {};
  @track tabRequests;

  handleToggleSection(event) {
    this.activeSectionMessage =
      'Open section name:  ' + event.detail.openSections;
  }
  handleEnvTab(event) {
    if (event.target.label === 'Production') {
      this.tabRequests = this.productionItems;
    } else if (event.target.label === 'Lower Environment') {
      this.tabRequests = this.lowerEnvItems;
    } else if (event.target.label === 'Implementation') {
      this.tabRequests = this.implementationItems;
    }
  }
  connectedCallback() {
    getRdsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.rdsRequests = result;
        this.getEnvironmentItems(this.rdsRequests, 'rds');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getEc2Requests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ec2Requests = result;
        this.getEnvironmentItems(this.ec2Requests, 'ec2');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      
      getDataTransferRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.dataTransferRequests = result;
        this.getEnvironmentItems(this.dataTransferRequests, 'dataTransfer');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getVpcRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.vpcRequests = result;
        this.getEnvironmentItems(this.vpcRequests, 'vpc');
      })
      .catch(error => {
        this.error = error;
        this.vpcRequests = undefined;
      });

    getEfsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.efsRequests = result;
        this.getEnvironmentItems(this.efsRequests, 'efs');
      })
      .catch(error => {
        this.error = error;
        this.efsRequests = undefined;
      });

    getEbsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ebsRequests = result;
        this.getEnvironmentItems(this.ebsRequests, 'ebs');
      })
      .catch(error => {
        this.error = error;
        this.ebsRequests = undefined;
      });

    getElbRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.elbRequests = result;
        this.getEnvironmentItems(this.elbRequests, 'elb');
      })
      .catch(error => {
        this.error = error;
        this.ec2Requests = undefined;
      });

      getQuickSightRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.quickSightRequests = result;
        this.getEnvironmentItems(this.quickSightRequests, 'quicksight');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });

      getLambdaRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.lambdaRequests = result;
        this.getEnvironmentItems(this.lambdaRequests, 'lambda');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });

      getEmrRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.emrRequests = result;
        this.getEnvironmentItems(this.emrRequests, 'emr');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getRdsBkupRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.rdsBkupRequests = result;
        this.getEnvironmentItems(this.rdsBkupRequests, 'rdsBkup');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getS3Requests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.s3Requests = result;
        this.getEnvironmentItems(this.s3Requests, 's3');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getOtherRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.otherRequests = result;
        this.getEnvironmentItems(this.otherRequests, 'other');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getRedshiftRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.redshiftRequests = result;
        this.getEnvironmentItems(this.redshiftRequests, 'redshift');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getWorkspaceRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.workspaceRequests = result;
        this.getEnvironmentItems(this.workspaceRequests, 'workspaces');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getQuickSightRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.quickSightRequests = result;
        this.getEnvironmentItems(this.quickSightRequests, 'quicksight');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
      getDdbRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ddbRequests = result;
        this.getEnvironmentItems(this.ddbRequests, 'dynamoDB');
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
  }

  getEnvironmentItems(items, type) {
    let pItems = [];
    let iItems = [];
    let lItems = [];
    items.forEach(element => {
      if (element.Environment__c === 'Production') {
        pItems.push(element);
      } else if (element.Environment__c === 'Implementation') {
        iItems.push(element);
      } else if (element.Environment__c === 'Lower Environment') {
        lItems.push(element);
      }
    });
    if (type === 'ec2') {
      this.productionItems.ec2 = pItems;
      this.implementationItems.ec2 = iItems;
      this.lowerEnvItems.ec2 = lItems;
    } else if (type === 'ebs') {
      this.productionItems.ebs = pItems;
      this.implementationItems.ebs = iItems;
      this.lowerEnvItems.ebs = lItems;
    } else if (type === 'vpc') {
      this.productionItems.vpc = pItems;
      this.implementationItems.vpc = iItems;
      this.lowerEnvItems.vpc = lItems;
    } else if (type === 'rds') {
      this.productionItems.rds = pItems;
      this.implementationItems.rds = iItems;
      this.lowerEnvItems.rds = lItems;
    } else if (type === 'efs') {
      this.productionItems.efs = pItems;
      this.implementationItems.efs = iItems;
      this.lowerEnvItems.efs = lItems;
    } else if (type === 'elb') {
      this.productionItems.elb = pItems;
      this.implementationItems.elb = iItems;
      this.lowerEnvItems.efs = lItems;
    } else if (type === 'quicksight') {
      this.productionItems.quicksight = pItems;
      this.implementationItems.quicksight = iItems;
      this.lowerEnvItems.efs = lItems;
    } else if (type === 'lambda') {
      this.productionItems.lambda = pItems;
      this.implementationItems.lambda = iItems;
      this.lowerEnvItems.lambda = lItems;
    } else if (type === 'rdsBkup') {
      this.productionItems.rdsBkup = pItems;
      this.implementationItems.rdsBkup = iItems;
      this.lowerEnvItems.rdsBkup = lItems;
    } else if (type === 'emr') {
      this.productionItems.emr = pItems;
      this.implementationItems.emr = iItems;
      this.lowerEnvItems.emr = lItems;
    } else if (type === 's3') {
      this.productionItems.s3 = pItems;
      this.implementationItems.s3 = iItems;
      this.lowerEnvItems.s3 = lItems;
    } else if (type === 'other') {
      this.productionItems.other = pItems;
      this.implementationItems.other = iItems;
      this.lowerEnvItems.other = lItems;
    } else if (type === 'redshift') {
      this.productionItems.redshift = pItems;
      this.implementationItems.redshift = iItems;
      this.lowerEnvItems.redshift = lItems;
    } else if (type === 'workspaces') {
      this.productionItems.workspaces = pItems;
      this.implementationItems.workspaces = iItems;
      this.lowerEnvItems.workspaces = lItems;
    } else if (type === 'quicksight') {
      this.productionItems.quicksight = pItems;
      this.implementationItems.quicksight = iItems;
      this.lowerEnvItems.quicksight = lItems;
    } else if (type === 'dynamoDB') {
      this.productionItems.dynamoDB = pItems;
      this.implementationItems.dynamoDB = iItems;
      this.lowerEnvItems.dynamoDB = lItems;
    } else if (type === 'dataTransfer') {
      this.productionItems.dataTransfer = pItems;
      this.implementationItems.dataTransfer = iItems;
      this.lowerEnvItems.dataTransfer = lItems;
    }
    this.tabRequests = this.productionItems;
  }
}