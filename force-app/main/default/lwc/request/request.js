/* eslint-disable no-console */
import { LightningElement, track, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { unregisterAllListeners } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ADOName_FIELD from "@salesforce/schema/Ocean_Request__c.ADO_Name__r.Name";
import Application_Name_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Name__c";
import ProjectName_FIELD from "@salesforce/schema/Ocean_Request__c.ProjectName__c";
import Application_Acronym_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__r.Application_Acronym__c";
import Application_Name_LKUP_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__c";
import Cloud_Service_Provider_Project_Number_FIELD from "@salesforce/schema/Ocean_Request__c.Cloud_Service_Provider_Project_Number__c";
import Assumptions_FIELD from "@salesforce/schema/Ocean_Request__c.Assumptions__c";
import AWSInstances_FIELD from "@salesforce/schema/Ocean_Request__c.AWSInstances__c";
import Wave_FIELD from "@salesforce/schema/Ocean_Request__c.Ocean_Wave__c";
import getOceanRequestById from "@salesforce/apex/OceanController.getOceanRequestById";
import SUCCESS_TICK from "@salesforce/resourceUrl/successtick";
import getApplicationDetails from "@salesforce/apex/OceanController.getApplicationDetails";
import getUserRoleAccess from "@salesforce/apex/OceanUserAccessController.getUserRoleAccess";

const FIELDS = [AWSInstances_FIELD, Assumptions_FIELD];

export default class Request extends LightningElement {
  @api currentOceanRequest;
  @track currentUserAccess;
  @track isLoadComplete = false;
  @track showProjectDetails = false;
  @track showLoadingSpinner = false;
  @track error;
  @track awsInstances = [];
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
  @track request1 = "Request";
  @track requestStatus;
  @track requestId;
  @track showAdminTab = false;

  successtickUrl = SUCCESS_TICK;

  // state management - start
  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    if (this.currentOceanRequest.id)
      this.getOceanRequest(this.currentOceanRequest.id);
    else this.handleNewRequest(this.currentOceanRequest.applicationDetails);
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handleNewRequest(appDetails) {
    getApplicationDetails({ appId: appDetails.id })
      .then(d => {
        this.currentOceanRequest = {
          applicationDetails: d,
          requestStatus: "New",
          id: null,
          awsInstances: []
        };
        this.refreshFlagsNew();
        this.getUserAccessDetails(appDetails.id);
      })
      .catch(e => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error on creating a new request",
            message: e.message,
            variant: "error"
          })
        );
      });
  }

  submitHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    const appDetails = this.currentOceanRequest.applicationDetails;
    fields[ADOName_FIELD.fieldApiName] = appDetails.adoName;
    fields[Application_Name_LKUP_FIELD.fieldApiName] = appDetails.id;
    fields[Application_Name_FIELD.fieldApiName] = appDetails.name;
    fields[Wave_FIELD.fieldApiName] = appDetails.wave.id;
    fields[Application_Acronym_FIELD.fieldApiName] = appDetails.acronym;
    fields[Cloud_Service_Provider_Project_Number_FIELD.fieldApiName] =
      appDetails.projectNumber;
    fields[ProjectName_FIELD.fieldApiName] = appDetails.name;
    this.template.querySelector("lightning-record-form").submit(fields);
  }

  handleSuccess(event) {
    const oceanRequestId = event.detail.id;
    this.getOceanRequest(oceanRequestId);
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Ocean Request updated successfully",
        message: "Record ID: " + event.detail.id,
        variant: "success"
      })
    );
  }

  getOceanRequest(oceanRequestId) {
    getOceanRequestById({ id: oceanRequestId })
      .then(request => {
        this.currentOceanRequest = request;
        this.awsInstances = this.currentOceanRequest.awsInstances;
        this.refreshFlags();
        this.getUserAccessDetails(
          this.currentOceanRequest.applicationDetails.id
        );
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

  getUserAccessDetails(appId) {
    this.currentUserAccess = {};
    getUserRoleAccess({ appId: appId })
      .then(ua => {
        this.currentUserAccess = ua;
        this.activateAccessContols(this.currentUserAccess.access);
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

  activateAccessContols(access){
    this.showAdminTab = access.Approve__c || access.Review__c;
  }

  refreshFlagsNew() {
    this.showLoadingSpinner = false;
    this.isLoadComplete = true;
  }

  refreshFlags() {
    this.showTabs = true;
    this.isLoadComplete = true;
    this.showLoadingSpinner = false;
  }

  showRequest() {
    this.resetAllForms();
    this.isOceanRequestShow = true;
    if (this.currentOceanRequest.id != null) this.editMode = true;
  }

  handleRequestStatusChange() {
    this.showLoadingSpinner = true;
    this.isLoadComplete = false;
    this.getOceanRequest(this.currentOceanRequest.id);
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Request status changed successfully",
        message: "Status changed",
        variant: "success"
      })
    );
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
    } else if (label === "EC2") {
      this.showEc2ComputeForm = true;
    } else if (label === "RDS") {
      this.showRDSDbForm = true;
    } else if (label === "EBS") {
      this.showEbsRequestForm = true;
    } else if (label === "ELB") {
      this.showElbRequestForm = true;
    } else if (label === "EFS") {
      this.showEfsStorageForm = true;
    } else if (label === "Redshift") {
      this.showRedshiftForm = true;
    } else if (label === "S3") {
      this.showS3RequestForm = true;
    } else if (label === "EMR") {
      this.showEmrForm = true;
    } else if (label === "Lambda") {
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
    } else if (label === "Other Service") {
      this.showOtherRequestForm = true;
    } else if (label === "Request Summary") {
      this.showReviewPage = true;
    } else if (label === "Admin Review") {
      this.showAdminReviewPage = true;
    }
  }

  resetAllForms() {
    this.isOceanRequestShow = false;
    this.showReviewPage = false;
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
}
