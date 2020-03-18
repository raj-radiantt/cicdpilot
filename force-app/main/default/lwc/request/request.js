/* eslint-disable no-console */
import { LightningElement, track, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { unregisterAllListeners } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ADOName_FIELD from "@salesforce/schema/Ocean_Request__c.ADO_Name__r.Name";
import Application_Name_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Name__c";
import ProjectName_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__r.Project_Acronym__r.Name";
import Application_Acronym_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__r.Application_Acronym__c";
import Application_Name_LKUP_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__c";
import Cloud_Service_Provider_Project_Number_FIELD from "@salesforce/schema/Ocean_Request__c.ApplicationName__r.Project_Acronym__r.Project_Number__c";
import Assumptions_FIELD from "@salesforce/schema/Ocean_Request__c.Assumptions__c";
import AWSInstances_FIELD from "@salesforce/schema/Ocean_Request__c.AWSInstances__c";
import Wave_FIELD from "@salesforce/schema/Ocean_Request__c.Ocean_Wave__c";
import getOceanRequestById from "@salesforce/apex/OceanController.getOceanRequestById";
import SUCCESS_TICK from "@salesforce/resourceUrl/successtick";
import getApplicationDetails from "@salesforce/apex/OceanController.getApplicationDetails";
import getUserRoleAccess from "@salesforce/apex/OceanUserAccessController.getUserRoleAccess";
import getCRRUIMetadata from "@salesforce/apex/OceanCRRUIController.getCRRUIMetadata";

const FIELDS = [AWSInstances_FIELD, Assumptions_FIELD];

export default class Request extends LightningElement {
  @api currentOceanRequest;
  @track currentUserAccess;
  @track isLoadComplete = false;
  @track showProjectDetails = false;
  @track showLoadingSpinner = false;
  @track error;
  @track awsInstances = [];
  @track editMode = false;
  @track fields = FIELDS;
  @track request1 = "Request";
  @track requestStatus;
  @track requestId;
  @track showAdminTab = false;
  @track formMode = "edit";
  @track activeRequestTab = "Ocean Request";
  @track crrUIMetadata;

  successtickUrl = SUCCESS_TICK;

  // state management - start
  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    if (this.currentOceanRequest.id) this.hendleExistingRequest();
    else if (this.currentOceanRequest.applicationDetails)
      this.handleNewRequest(this.currentOceanRequest.applicationDetails);
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  hendleExistingRequest(requestId = undefined, isAdmin = false) {
    getCRRUIMetadata({
      reqId: requestId ? requestId : this.currentOceanRequest.id
    }).then(r => {
      if (r) {
        this.crrUIMetadata = r;
        this.getOceanRequest(
          requestId ? requestId : this.currentOceanRequest.id,
          isAdmin
        );
      }
    });
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
        this.getUserAccessDetails(appDetails.id, false);
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
    fields[ProjectName_FIELD.fieldApiName] = appDetails.projectName;
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }

  handleSuccess(event) {
    const oceanRequestId = event.detail.id;
    this.hendleExistingRequest(oceanRequestId, false);
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Ocean Request",
        message: "Request updated successfully",
        variant: "success"
      })
    );
  }

  handleReset() {
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach(field => {
        field.reset();
      });
    }
  }

  getOceanRequest(oceanRequestId, isAdmin = false) {
    getOceanRequestById({ id: oceanRequestId })
      .then(request => {
        this.isLoadComplete = false;
        this.currentOceanRequest = request;
        this.awsInstances = this.crrUIMetadata.filter(m =>  
          this.currentOceanRequest.awsInstances.includes(m.AWS_Instance__c)
        );
        this.getUserAccessDetails(
          this.currentOceanRequest.applicationDetails.id,
          isAdmin
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

  getUserAccessDetails(appId, isAdmin = false) {
    this.currentUserAccess = {};
    getUserRoleAccess({ appId: appId })
      .then(ua => {
        this.currentUserAccess = ua;
        this.activateAccessControls(this.currentUserAccess.access);
        this.refreshFlags();
        this.activeRequestTab = isAdmin ? "Admin Review" : "Ocean Request";
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

  activateAccessControls(access) {
    const requestStatus = this.currentOceanRequest.CRMTStatus;
    this.formMode =
      (access.Review__c && requestStatus !== "Review Complete") ||
      (access.Approve_Request_Submission__c &&
        requestStatus === "COR/GTL Approval") ||
      (access.Create__c && requestStatus === "Draft")
        ? "edit"
        : "readonly";
    this.showAdminTab = access.Approve__c || access.Review__c;
  }

  refreshFlags() {
    this.isLoadComplete = true;
    this.showLoadingSpinner = false;
  }

  showRequest() {
    this.editMode = this.currentOceanRequest.id != null;
  }

  handleRequestStatusChange(event) {
    this.showLoadingSpinner = true;
    this.isLoadComplete = false;
    this.handleExistingRequest(event.detail);
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Request status changed successfully",
        message: "Status changed",
        variant: "success"
      })
    );
  }
}