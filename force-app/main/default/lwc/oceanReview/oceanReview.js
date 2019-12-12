/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getRdsRequests from "@salesforce/apex/OceanController.getRdsRequests";
import getVpcRequests from "@salesforce/apex/OceanController.getVpcRequests";
import getEc2Requests from "@salesforce/apex/OceanController.getEc2Instances";
import getEfsRequests from "@salesforce/apex/OceanController.getEfsRequests";
import getEbsRequests from "@salesforce/apex/OceanController.getEbsStorages";
import getDataTransferRequests from "@salesforce/apex/OceanController.getDataTransferRequests";
import getWorkspaceRequests from "@salesforce/apex/OceanController.getWorkspaceRequests";
import getRedshiftRequests from "@salesforce/apex/OceanController.getRedshiftRequests";
import getOtherRequests from "@salesforce/apex/OceanController.getOtherRequests";
import getS3Requests from "@salesforce/apex/OceanController.getS3Requests";
import getRdsBkupRequests from "@salesforce/apex/OceanController.getRdsBkupRequests";
import getElbRequests from "@salesforce/apex/OceanController.getElbRequests";
import getEmrRequests from "@salesforce/apex/OceanController.getEmrRequests";
import getLambdaRequests from "@salesforce/apex/OceanController.getLambdaRequests";
import getQuickSightRequests from "@salesforce/apex/OceanController.getQuickSightRequests";
import OCEAN_STATUS_FIELD from "@salesforce/schema/Ocean_Request__c.Request_Status__c";
import OCEAN_CRMT_STATUS_FIELD from "@salesforce/schema/Ocean_Request__c.CRMT_Request_Status__c";
import getDdbRequests from "@salesforce/apex/OceanController.getDdbRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Request__c.Id";
import ESTMATED_TOTAL_COST_FIELD from "@salesforce/schema/Ocean_Request__c.Total_Estimated_Cost__c";
import getUserRoleAccess from "@salesforce/apex/OceanUserAccessController.getUserRoleAccess";

export default class OceanReview extends LightningElement {
  @api currentOceanRequest;
  @track currentUserAccess;
  @api isAdoRequestor;
  @api isReadonlyUser;
  @track showSpinner;
  @track userAction;
  @track isDraft;
  @track isApproved = false;
  @track isCORApproval = false;
  @track rdsColumns = [
    { label: "Status", fieldName: "Resource_Status__c", type: "text" },
    { label: "Request Id", fieldName: "Name", type: "text" },
    { label: "Environment", fieldName: "Environment__c", type: "text" },
    { label: "Region", fieldName: "AWS_Region__c", type: "text" },
    {
      label: "Availability Zone",
      fieldName: "AWS_Availability_Zone__c",
      type: "text"
    }
  ];
  @track disableSubmit = true;
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
  @track calculatedCosts = {
    implementation: {},
    production: {},
    lowerenv: {},
    env: {
      implementation: 0,
      production: 0,
      lowerenv: 0
    }
  };
  @track activeSectionMessage = "";
  @track productionItems = {};
  @track implementationItems = {};
  @track lowerEnvItems = {};
  @track tabRequests;
  @track confirmDialogue = false;
  @track totalCost = 0;
  @track environmentCost = 0;
  @track environment = "Production";
  @track requestCost = {};
  @track isApprove = false;
  @track isDeny = false;


  handleToggleSection(event) {
    this.activeSectionMessage =
      "Open section name:  " + event.detail.openSections;
  }
  handleSetActiveSectionC(event) {
    const accordion = this.template.querySelector(".example-accordion");
    accordion.activeSectionName = "RDS";
    this.activeSectionMessage =
      "Open section name:  " + event.detail.openSections;
  }
  handleEnvTab(event) {
    if (event.target.label === "Production") {
      this.tabRequests = this.productionItems;
      this.environmentCost = this.calculatedCosts.env.production;
      this.requestCost = this.calculatedCosts.production;
      this.environment = "Production";
    } else if (event.target.label === "Lower Environment") {
      this.tabRequests = this.lowerEnvItems;
      this.environmentCost = this.calculatedCosts.env.lowerenv;
      this.requestCost = this.calculatedCosts.lowerenv;
      this.environment = "Lower Environment";
    } else if (event.target.label === "Implementation") {
      this.tabRequests = this.implementationItems;
      this.environmentCost = this.calculatedCosts.env.implementation;
      this.requestCost = this.calculatedCosts.implementation;
      this.environment = "Implementation";
    }
  }
  connectedCallback() {
    this.getUserAccessDetails();
    getRdsRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.rdsRequests = result;
        this.getEnvironmentItems(this.rdsRequests, "rds");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getEc2Requests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.ec2Requests = result;
        this.getEnvironmentItems(this.ec2Requests, "ec2");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });

    getDataTransferRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.dataTransferRequests = result;
        this.getEnvironmentItems(this.dataTransferRequests, "dataTransfer");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getVpcRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.vpcRequests = result;
        this.getEnvironmentItems(this.vpcRequests, "vpc");
      })
      .catch(error => {
        this.error = error;
        this.vpcRequests = undefined;
      });

    getEfsRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.efsRequests = result;
        this.getEnvironmentItems(this.efsRequests, "efs");
      })
      .catch(error => {
        this.error = error;
        this.efsRequests = undefined;
      });

    getEbsRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.ebsRequests = result;
        this.getEnvironmentItems(this.ebsRequests, "ebs");
      })
      .catch(error => {
        this.error = error;
        this.ebsRequests = undefined;
      });

    getElbRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.elbRequests = result;
        this.getEnvironmentItems(this.elbRequests, "elb");
      })
      .catch(error => {
        this.error = error;
        this.ec2Requests = undefined;
      });

    getQuickSightRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.quickSightRequests = result;
        this.getEnvironmentItems(this.quickSightRequests, "quicksight");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });

    getLambdaRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.lambdaRequests = result;
        this.getEnvironmentItems(this.lambdaRequests, "lambda");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });

    getEmrRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.emrRequests = result;
        this.getEnvironmentItems(this.emrRequests, "emr");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getRdsBkupRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.rdsBkupRequests = result;
        this.getEnvironmentItems(this.rdsBkupRequests, "rdsBkup");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getS3Requests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.s3Requests = result;
        this.getEnvironmentItems(this.s3Requests, "s3");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getOtherRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.otherRequests = result;
        this.getEnvironmentItems(this.otherRequests, "other");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getRedshiftRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.redshiftRequests = result;
        this.getEnvironmentItems(this.redshiftRequests, "redshift");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getWorkspaceRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.workspaceRequests = result;
        this.getEnvironmentItems(this.workspaceRequests, "workspaces");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getDdbRequests({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        this.ddbRequests = result;
        this.getEnvironmentItems(this.ddbRequests, "dynamoDB");
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
  }

  getUserAccessDetails() {
    this.currentUserAccess = {};
    const appId = this.currentOceanRequest.applicationDetails.id;
    getUserRoleAccess({ appId: appId })
      .then(ua => {
        this.currentUserAccess = ua;
        this.isDraft =
          this.currentUserAccess.access.Create__c &&
          this.currentOceanRequest.requestStatus === "Draft";
        this.isCORApproval =
          this.currentUserAccess.access.Approve_Request_Submission__c &&
          this.currentOceanRequest.requestStatus === "COR/GTL Approval";
        this.userAction = this.isDraft
          ? "COR/GTL Approval"
          : this.isCORApproval
          ? "CRMT Intake Review"
          : "";
      })
      .catch(e => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error fetching user access",
            message: e.message,
            variant: "error"
          })
        );
      });
  }

  getEnvironmentItems(items, type) {
    this.productionItems[type] = items.filter(
      e => e.Environment__c === "Production"
    );
    this.implementationItems[type] = items.filter(
      e => e.Environment__c === "Implementation"
    );
    this.lowerEnvItems[type] = items.filter(
      e => e.Environment__c === "Lower Environment"
    );
    // Calculate cost per environment per type
    this.calculatedCosts.implementation[type] = this.implementationItems[
      type
    ].reduce(
      (sum, item) =>
        this.scaleFloat(sum) + this.scaleFloat(item.Calculated_Cost__c),
      0
    );
    this.calculatedCosts.production[type] = this.productionItems[type].reduce(
      (sum, item) =>
        this.scaleFloat(sum) + this.scaleFloat(item.Calculated_Cost__c),
      0
    );
    this.calculatedCosts.lowerenv[type] = this.lowerEnvItems[type].reduce(
      (sum, item) =>
        this.scaleFloat(sum) + this.scaleFloat(item.Calculated_Cost__c),
      0
    );
    // Calculate cost per environment
    this.calculatedCosts.env.production += this.calculatedCosts.production[
      type
    ];
    this.calculatedCosts.env.implementation += this.calculatedCosts.implementation[
      type
    ];
    this.calculatedCosts.env.lowerenv += this.calculatedCosts.lowerenv[type];
    // Calculate total cost
    this.totalCost = items.reduce(
      (sum, item) =>
        this.scaleFloat(sum) + this.scaleFloat(item.Calculated_Cost__c),
      this.totalCost
    );
    this.tabRequests = this.productionItems;
  }

  openDialogue(event) {
    if (event.target.value === 'approve') this.triggerApprove(); 
    else if (event.target.value === 'deny') this.triggerDeny();
    this.confirmDialogue = true;
  }

  triggerApprove(){
    this.isApprove = true;
    this.isDeny = false;
  }

  triggerDeny(){
    this.isDeny = true;
    this.isApprove = false;
  }

  closeDialogue() {
    this.confirmDialogue = false;
  }

  scaleFloat(v) {
    v = parseFloat(v);
    return isNaN(v) ? 0 : v;
  }
  reviewSubmitHandler(event) {
    if (event.target.checked) {
      this.disableSubmit = false;
    } else {
      this.disableSubmit = true;
    }
  }
  submitRequest() {
    this.confirmDialogue = false;
    this.showSpinner = true;
    // Create the recordInput object
    const fields = {};
    fields[ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    if (this.isDraft) {
      fields[OCEAN_STATUS_FIELD.fieldApiName] = fields[
        OCEAN_CRMT_STATUS_FIELD.fieldApiName
      ] = "COR/GTL Approval";
    } else if (this.isCORApproval && !this.isDeny) {
      fields[OCEAN_CRMT_STATUS_FIELD.fieldApiName] = "CRMT Intake Review";
    } else if (this.isDeny){
      fields[OCEAN_STATUS_FIELD.fieldApiName] = fields[OCEAN_CRMT_STATUS_FIELD.fieldApiName] = "Draft";
    }
    fields[ESTMATED_TOTAL_COST_FIELD.fieldApiName] = this.totalCost;
    const recordInput = { fields: fields };
    updateRecord(recordInput)
      .then(() => {
        this.showSpinner = false;
        if (this.isDraft) {
          this.isDraft = false;
        } else if (this.isCORApproval) {
          this.isCORApproval = false;
          this.canWithdraw = false;
        }
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Request has been submitted successfully!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.showSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error submitting request. Please try again",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }
  closeModal() {
    this.confirmDialogue = false;
  }
}