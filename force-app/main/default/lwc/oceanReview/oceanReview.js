/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import getRdsRequests from "@salesforce/apex/OceanController.getRdsRequests";
import getVpcRequests from "@salesforce/apex/OceanController.getVpcRequests";
import getEc2Requests from "@salesforce/apex/OceanController.getEc2Instances";
import getEfsRequests from "@salesforce/apex/OceanController.getEfsRequests";
import getEbsRequests from "@salesforce/apex/OceanController.getEbsStorages";

export default class OceanReview extends LightningElement {
  @api oceanRequestId;
  @track rdsColumns = [
    { label: "Status", fieldName: "Resource_Status__c", type: "text" },
    { label: "Request Id", fieldName: "RDS_Request_Id__c", type: "text" },
    { label: "Environment", fieldName: "Environment__c", type: "text" },
    { label: "Region", fieldName: "AWS_Region__c", type: "text" },
    {
      label: "Availability Zone",
      fieldName: "AWS_Availability_Zone__c",
      type: "text"
    }
  ];
  @track ec2Requests;
  @track vpcRequests;
  @track ebsRequests;
  @track efsRequests;
  @track rdsRequests;
  @track activeSectionMessage = "";
  @track productionItems = {};
  @track implementationItems = {} ;
  @track lowerEnvItems = {} ;
  @track tabRequests;

  handleToggleSection(event) {
    this.activeSectionMessage = "Open section name:  " + event.detail.openSections;
  }
  handleSetActiveSectionC() {
    const accordion = this.template.querySelector(".example-accordion");
    accordion.activeSectionName = "RDS";
  }
  handleEnvTab(event) {
    if(event.target.label === 'Production') {
      this.tabRequests = this.productionItems;
    } else if(event.target.label === 'Lower Environment') {
      this.tabRequests = this.lowerEnvItems;
    } else if(event.target.label === 'Implementation') {
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

    getEc2Requests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ec2Requests = result;
        this.getEnvironmentItems(this.ec2Requests, 'ec2');
      })
      .catch(error => {
        this.error = error;
        this.ec2Requests = undefined;
      });
  }

  getEnvironmentItems(items, type) {
    let pItems = [];
    let iItems = [];
    let lItems = [];
    items.forEach(element => {
      if (element.Environment__c === 'Production') {
        pItems.push(element);
      }
      else if (element.Environment__c === 'Implementation') {
        iItems.push(element);
      }
      else if (element.Environment__c === 'Lower Environment') {
        lItems.push(element);
      }
    });
    if(type === 'ec2') {
      this.productionItems.ec2 = pItems;
      this.implementationItems.ec2 = iItems;
      this.lowerEnvItems.ec2 = lItems;
    } else if(type === 'ebs') {
      this.productionItems.ebs = pItems;
      this.implementationItems.ebs = iItems;
      this.lowerEnvItems.ebs = lItems;
    } else if(type === 'vpc') {
      this.productionItems.vpc = pItems;
      this.implementationItems.vpc = iItems;
      this.lowerEnvItems.vpc = lItems;
    } else if(type === 'rds') {
      this.productionItems.rds = pItems;
      this.implementationItems.rds = iItems;
      this.lowerEnvItems.rds = lItems;
    } else if(type === 'efs') {
      this.productionItems.efs = pItems;
      this.implementationItems.efs = iItems;
      this.lowerEnvItems.efs = lItems;
    }
    this.tabRequests = this.productionItems;
  }
}