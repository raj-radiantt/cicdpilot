/* eslint-disable no-console */
import { LightningElement, track, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { fireEvent } from "c/pubsub";
//import ID_FIELD from "@salesforce/schema/Ocean_Request__c.Id";
import ADOName_FIELD from "@salesforce/schema/Ocean_Request__c.ADOName__c";
import Application_Acronym_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Acronym__c";
import Application_Name_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Name__c";
import Assumptions_FIELD from "@salesforce/schema/Ocean_Request__c.Assumptions__c";
import AWSAccountName_FIELD from "@salesforce/schema/Ocean_Request__c.AWSAccountName__c";
import Cloud_Service_Provider_Project_Number_FIELD from "@salesforce/schema/Ocean_Request__c.Cloud_Service_Provider_Project_Number__c";
import Current_Approved_Resources_FIELD from "@salesforce/schema/Ocean_Request__c.Current_Approved_Resources__c";
import MonthsInPoP_FIELD from "@salesforce/schema/Ocean_Request__c.MonthsInPoP__c";
import No_Additional_Funding_Requested_FIELD from "@salesforce/schema/Ocean_Request__c.No_Additional_Funding_Requested__c";
import Number_of_AWS_Accounts_FIELD from "@salesforce/schema/Ocean_Request__c.Number_of_AWS_Accounts__c";
import Option_Year_FIELD from "@salesforce/schema/Ocean_Request__c.Option_Year__c";
import Option_Year_End_Date_FIELD from "@salesforce/schema/Ocean_Request__c.Option_Year_End_Date__c";
import Option_Year_Start_Date_FIELD from "@salesforce/schema/Ocean_Request__c.Option_Year_Start_Date__c";
import PeriodOfPerformance_FIELD from "@salesforce/schema/Ocean_Request__c.PeriodOfPerformance__c";
import ProjectName_FIELD from "@salesforce/schema/Ocean_Request__c.ProjectName__c";
import AWSInstances_FIELD from "@salesforce/schema/Ocean_Request__c.AWSInstances__c";
import Wave_Submitted_FIELD from "@salesforce/schema/Ocean_Request__c.Wave_Submitted__c";
import getOceanRequestById from "@salesforce/apex/OceanController.getOceanRequestById";
const FIELDS = [
  ADOName_FIELD,
  Application_Name_FIELD,
  Application_Acronym_FIELD,
  AWSAccountName_FIELD,
  ProjectName_FIELD,
  Cloud_Service_Provider_Project_Number_FIELD,
  PeriodOfPerformance_FIELD,
  MonthsInPoP_FIELD,
  Option_Year_FIELD,
  Option_Year_Start_Date_FIELD,
  Option_Year_End_Date_FIELD,
  Wave_Submitted_FIELD,
  AWSInstances_FIELD,
  Number_of_AWS_Accounts_FIELD,
  No_Additional_Funding_Requested_FIELD,
  Current_Approved_Resources_FIELD,
  Assumptions_FIELD,
];

export default class Request extends LightningElement {
  @api oceanRequestId;
  @track oceanRequest;
  @track awsInstances;
  @track disabled = false;
  @track showLoadingSpinner = false;
  @track error;
  @track isEc2Current = false;
  @track isOceanRequestShow = true;
  @track showTabs = false;
  @track showBkupReqForm = false;
  @track showBsDataTransferForm = false;
  @track showDynamoDBForm = false;
  @track showEbsStorageForm = false;
  @track showEc2ComputeForm = false;
  @track showEfsStorageForm = false;
  @track showElbRequestForm = false;
  @track showEmrRequestForm = false;
  @track showGlacierForm = false;
  @track showLambdaForm = false;
  @track showOtherRequestForm = false;
  @track showRDSDbForm = false;
  @track showRedshiftDataNodesForm = false;
  @track showReviewPage = false;
  @track showS3DataForm = false;
  @track showS3RequestForm = false;
  @track showSnowballForm = false;
  @track showVpcForm = false;
  @track showWorkspacesForm = false;
  @track showEmrForm = false;
  @track editMode = false;
  @track fields = FIELDS;

  @track totalEc2ComputePrice;
  @track totalEbsStoragePrice;
  @track totalVpcRequestPrice;
  @track currentProjectDetails = null;

  // state management - start

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    registerListener("totalEc2ComputePrice", this.handleEc2PriceChange, this);
    registerListener("totalEbsStoragePrice", this.handleEbsStoragePriceChange, this);
    registerListener("totalVpcRequestPrice", this.handleVpcRequestPriceChange, this);
    registerListener("totalEfsRequestPrice", this.handleEfsRequestPriceChange, this);
    registerListener("showDraftRequests", this.handleDraftRequests, this);
    registerListener("currentProject", this.handleProjectDetails, this);
    if (this.oceanRequestId) {
      this.getOceanRequest();
      this.editMode = true;
    }
  }
  handleProjectDetails(input) {
    this.currentProjectDetails = input;
    console.log('Project Details in Request: ' + JSON.stringify(this.currentProjectDetails));
  }
  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handleEc2PriceChange(inpVal) {
    this.totalEc2ComputePrice = inpVal;
    this.updateTotalRequestCost();
  }

  handleEfsRequestPriceChange(inpVal) {
    this.totalEfsRequestPrice = inpVal;
    this.updateTotalRequestCost();
  }

  handleEbsStoragePriceChange(inpVal) {
    this.totalEbsStoragePrice = inpVal;
    this.updateTotalRequestCost();
  }

  handleVpcRequestPriceChange(inpVal) {
    this.totalEbsStoragePrice = inpVal;
    this.updateTotalRequestCost();
  }

  updateTotalRequestCost() {
    this.totalRequestCost = parseFloat(this.totalEc2ComputePrice).toFixed(2) + parseFloat(this.totalEbsStoragePrice).toFixed(2) 
  }

  // state management - end

  handleSuccess(event) {
    const evt = new ShowToastEvent({
      title: "Ocean Request updated successfully",
      message: "Record ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
    fireEvent(this.pageRef, "oceanRequest", event.detail);
    this.oceanRequest = event.detail;
    this.oceanRequestId = event.detail.id;
    this.getOceanRequest();
    this.showTabs = true;
  }
  getOceanRequest() {
    getOceanRequestById({ id: this.oceanRequestId })
      .then(result => {
        this.oceanRequest = result;
        if (result.AWSInstances__c) {
          this.awsInstances = result.AWSInstances__c.split(";");
          this.showTabs = true;      
          console.log('Ocean Request: '+ JSON.stringify(this.oceanRequest));
          this.currentProjectDetails = {};
          this.currentProjectDetails.projectName = this.oceanRequest.ProjectName__c;
          this.currentProjectDetails.applicationName = this.oceanRequest.Application_Name__c;
          this.currentProjectDetails.projectNumber = this.oceanRequest.Cloud_Service_Provider_Project_Number__c;
        }
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }
  refreshFlags() {
    this.isOceanRequestShow = false;
    this.showTabs = true;
    if (this.awsInstances) {
      this.showActiveTab(this.awsInstances[0]);
    }
  }
  showRequest() {
    this.resetAllForms();
    this.isOceanRequestShow = true;
  }
  handleTab(event) {
    this.resetAllForms();
    const label = event.target.label;
    this.showActiveTab(label);
  }
  showActiveTab(label) {
    this.isOceanRequestShow = false;
    if (label === "EC2 Compute") {
      this.showEc2ComputeForm = true;
    } else if (label === "EBS (Storage)") {
      this.showEbsStorageForm = true;
    } else if (label === "EFS (Storage)") {
      this.showEfsStorageForm = true;
    } else if (label === "S3") {
      this.showS3RequestForm = true;
    } else if (label === "Glacier") {
      this.showGlacierForm = true;
    } else if (label === "BS Data Transfer") {
      this.showBsDataTransferForm = true;
    } else if (label === "Workspaces") {
      this.showWorkspacesForm = true;
    } else if (label === "S3 (Data)") {
      this.showS3DataForm = true;
    } else if (label === "Redshift") {
      this.showRedshiftDataNodesForm = true;
    } else if (label === "DynamoDB") {
      this.showDynamoDbForm = true;
    } else if (label === "ELB") {
      this.showElbRequestForm = true;
    } else if (label === "RDS") {
      this.showRDSDbForm = true;
    } else if (label === "EMR") {
      this.showEmrForm = true;
    } else if (label === "Snowball") {
      this.showSnowballForm = true;
    } else if (label === "VPC Request") {
      this.showVpcForm = true;
    } else if (label === "Review") {
      this.showReviewPage = true;
    } else if (label === "Lambda"){
      this.showLambdaForm = true;
    }
    
  }
  resetAllForms() {
    this.isOceanRequestShow = false;
    this.showReviewPage = false;
    this.showEc2ComputeForm = false;
    this.showEbsStorageForm = false;
    this.showElbRequestForm = false;
    this.showEfsStorageForm = false;
    this.showS3RequestForm = false;
    this.showGlacierForm = false;
    this.showBsDataTransferForm = false;
    this.showWorkspacesForm = false;
    this.showS3DataForm = false;
    this.showRedshiftDataNodesForm = false;
    this.showDynamoDbForm = false;
    this.showRDSDbForm = false;
    this.showEmrForm = false;
    this.showSnowballForm = false;
    this.showVpcForm = false;
    this.showLambdaForm = false;
  }
}