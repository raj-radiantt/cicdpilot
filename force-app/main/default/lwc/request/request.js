/* eslint-disable no-console */
import { LightningElement, track, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ADOName_FIELD from "@salesforce/schema/Ocean_Request__c.ADO_Name__c";
import Application_Name_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Name__c";
import Application_Name_LKUP_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__c";
import Cloud_Service_Provider_Project_Number_FIELD from "@salesforce/schema/Ocean_Request__c.Cloud_Service_Provider_Project_Number__c";
import Option_Year_FIELD from "@salesforce/schema/Ocean_Request__c.CSP_Option_Year__c";
import ProjectName_FIELD from "@salesforce/schema/Ocean_Request__c.ProjectName__c";
import Current_Approved_Resources_FIELD from "@salesforce/schema/Ocean_Request__c.Current_Approved_Resources__c";
import PeriodOfPerformance_FIELD from "@salesforce/schema/Ocean_Request__c.PeriodOfPerformance__c";
import MonthsInPoP_FIELD from "@salesforce/schema/Ocean_Request__c.MonthsInPoP__c";
import No_Additional_Funding_Requested_FIELD from "@salesforce/schema/Ocean_Request__c.No_Additional_Funding_Requested__c";
import Number_of_AWS_Accounts_FIELD from "@salesforce/schema/Ocean_Request__c.Number_of_AWS_Accounts__c";
import Assumptions_FIELD from "@salesforce/schema/Ocean_Request__c.Assumptions__c";
import AWSInstances_FIELD from "@salesforce/schema/Ocean_Request__c.AWSInstances__c";
import Wave_FIELD from "@salesforce/schema/Ocean_Request__c.Wave__c";
import getOceanRequestById from "@salesforce/apex/OceanController.getOceanRequestById";
import SUCCESS_TICK from "@salesforce/resourceUrl/successtick";
import getAwsAccountNames from "@salesforce/apex/OceanController.getAwsAccountNames";

const FIELDS = [
  Wave_FIELD,
  Option_Year_FIELD,
  PeriodOfPerformance_FIELD,
  MonthsInPoP_FIELD,
  Number_of_AWS_Accounts_FIELD,
  AWSInstances_FIELD,
  No_Additional_Funding_Requested_FIELD,
  Current_Approved_Resources_FIELD,
  Assumptions_FIELD,
];

export default class Request extends LightningElement {
  @api oceanRequestId;
  @api isAdoRequestor;
  @track showAdmin;
  @api isReadonlyUser;
  @api isCorgtl;
  @track oceanRequest;
  @track awsInstances;
  @track disabled = false;
  @track showProjectDetails = false;
  @track showLoadingSpinner = false;
  @track error;
  @track isEc2Current = false;
  @track isOceanRequestShow = true;
  @track showTabs = false;
  @track showVpcForm = false;
  @track showEc2ComputeForm = false;
  @track showRDSDbForm = false;
  @track showEbsRequestForm = false;
  @track showElbRequestForm = false;
  @track showEfsStorageForm = false;
  @track showRedshiftForm = false;
  @track showS3RequestForm = false;
  @track showEmrForm = false;
  @track showLambdaForm = false;
  @track showRdsBackupStorageForm = false;
  @track showDynamoDbForm = false;
  @track showDataTransferForm = false;
  @track showWorkspacesForm = false;
  @track showQuicksightForm = false;
  @track showOtherRequestForm = false;
  @track showReviewPage = false;
  @track showAdminReviewPage = false;
  @track editMode = false;
  @track fields = FIELDS;
  @track request1 = 'Request';
  @track requestStatus;
  @track requestId;

  @track totalEc2ComputePrice;
  @track totalEbsStoragePrice;
  @track totalVpcRequestPrice;
  @track currentProjectDetails;

  successtickUrl = SUCCESS_TICK;

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
    registerListener("newRequest", this.handleProjectDetails, this);
    if (this.oceanRequestId) {
      this.showProjectDetails = true;
      this.getOceanRequest();
      this.editMode = true;
    }
    this.isAdoRequestor = (localStorage.getItem('isAdoRequestor') === 'true');
    this.isReadonlyUser = (localStorage.getItem('isReadonlyUser') === 'true');
    this.isCorgtl = (localStorage.getItem('isCorgtl') === 'true');
    if(!this.isAdoRequestor) {
      this.showAdmin = true;
    }
    console.log('Requestor role? '+ this.isAdoRequestor);
    console.log('Readonly User role? '+ this.isReadonlyUser);
    console.log('showAdmin: ' + this.showAdmin);
  }
  
  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handleProjectDetails(input) {
    this.currentProjectDetails = input.currentProject;
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

  submitHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[ADOName_FIELD.fieldApiName] = this.currentProjectDetails.adoId;
    fields[Application_Name_LKUP_FIELD.fieldApiName] = this.currentProjectDetails.applicationId;
    fields[Application_Name_FIELD.fieldApiName] = this.currentProjectDetails.applicationName;
    fields[Cloud_Service_Provider_Project_Number_FIELD.fieldApiName] = this.currentProjectDetails.projectNumber;
    fields[ProjectName_FIELD.fieldApiName] = this.currentProjectDetails.projectName;
    this.template.querySelector('lightning-record-form').submit(fields);
  }
  handleSuccess(event) {
    const evt = new ShowToastEvent({
      title: "Ocean Request updated successfully",
      message: "Record ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
    this.oceanRequest = event.detail;
    this.oceanRequestId = event.detail.id;
    this.getOceanRequest();
    this.showTabs = true;
  }
  getOceanRequest() {
    getOceanRequestById({ id: this.oceanRequestId })
      .then(result => {
        this.oceanRequest = result;
        if(this.oceanRequest.Request_Status__c !== 'Draft') {
          this.showAdmin = !(this.isAdoRequestor && this.isReadonlyUser);
        }
        if (result.AWSInstances__c) {
          this.requestStatus = this.oceanRequest.Request_Status__c;
          if(result.AWSInstances__c) {
            this.awsInstances = result.AWSInstances__c.split(";");
          }
          this.showTabs = true;
          this.currentProjectDetails = {};
          this.requestId = this.oceanRequest.OCEAN_REQUEST_ID__c;
          this.currentProjectDetails.projectName = this.oceanRequest.ProjectName__c;
          this.currentProjectDetails.applicationName = this.oceanRequest.Application_Name__c;
          this.currentProjectDetails.projectNumber = this.oceanRequest.Cloud_Service_Provider_Project_Number__c;
          this.currentProjectDetails.wave = this.oceanRequest.Wave__c;
          this.currentProjectDetails.cspOptionYear = this.oceanRequest.CSP_Option_Year__c;
          this.currentProjectDetails.awsAccountName = this.oceanRequest.AWSAccountName__c;
          this.getAwsAccounts();
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
  
  getAwsAccounts() {
    getAwsAccountNames({ project: this.currentProjectDetails.projectName})
      .then(result => {
        if(result && result.length > 0) {
          if(result[0].AWS_Accounts__c) {
            const awsAccountNames = result[0].AWS_Accounts__c.split(';');
            const accounts = [];
            awsAccountNames.forEach( (element) => {
              accounts.push({label:element, value:element });
            });
            this.currentProjectDetails.awsAccounts = accounts;
          }
        }
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error while fetching AWS account names",
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
    if (label === "VPC Request") {
      this.showVpcForm = true;
    } else if (label === "EC2 Request") {
      this.showEc2ComputeForm = true;
    } else if (label === "RDS Request") {
      this.showRDSDbForm = true;
    } else if (label === "EBS Request") {
      this.showEbsRequestForm = true;
    } else if (label === "ELB Request") {
      this.showElbRequestForm = true;
    } else if (label === "EFS Request") {
      this.showEfsStorageForm = true;
    } else if (label === "Redshift") {
      this.showRedshiftForm = true;
    } else if (label === "S3 Request") {
      this.showS3RequestForm = true;
    } else if (label === "EMR Request") {
      this.showEmrForm = true;
    } else if (label === "Lambda"){
      this.showLambdaForm = true;
    } else if (label === "RDS Backup Storage") {
      this.showRdsBackupStorageForm = true;
    } else if (label === "DynamoDB") {
      this.showDynamoDbForm = true;
    } else if (label === "Data Transfer") {
      this.showDataTransferForm = true;
    } else if (label === "Workspaces") {
      this.showWorkspacesForm = true;
    } else if (label === "Quicksight") {
      this.showQuicksightForm = true;
    } else if (label === "Other Request") {
      this.showOtherRequestForm = true;
    }  else  if (label === "Request Summary") {
      this.showReviewPage = true;
    } else if (label === "Admin Review") {
      this.showAdminReviewPage = true;
    }
  }
  
  resetAllForms() {
    this.isOceanRequestShow = false;
    this.showReviewPage = false;
    this.showAdminReviewPage = false;
    this.showVpcForm = false;
    this.showEc2ComputeForm = false;
    this.showRDSDbForm = false;
    this.showEbsRequestForm = false;
    this.showElbRequestForm = false;
    this.showEfsStorageForm = false;
    this.showRedshiftForm = false;
    this.showS3RequestForm = false;
    this.showEmrForm = false;
    this.showLambdaForm = false;
    this.showRdsBackupStorageForm = false;
    this.showDynamoDbForm = false;
    this.showDataTransferForm = false;
    this.showWorkspacesForm = false;
    this.showQuicksightForm = false;
    this.showOtherRequestForm = false;
    this.showReviewPage = false;
    this.showAdminReviewPage = false;
  }
  handleTabClick(event){
    console.log('Tab Click 1 ->  '+ JSON.stringify(event.target.label));
    console.log('Tab Click 2 ->  '+ JSON.stringify(event.target.key));
    console.log('Tab Click 3 -> '+ JSON.stringify(event.target.title));
  }
}