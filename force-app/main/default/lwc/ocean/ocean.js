/* eslint-disable no-console */
import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { loadStyle } from "lightning/platformResourceLoader";
import OCEAN_ASSETS_URL from "@salesforce/resourceUrl/ocean";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getSubmittedRequests from "@salesforce/apex/OceanUserAccessController.getSubmittedRequests";
import getApprovedRequests from "@salesforce/apex/OceanUserAccessController.getApprovedRequests";
import getDraftRequests from "@salesforce/apex/OceanUserAccessController.getDraftRequests";
import getApplicationDetails from "@salesforce/apex/OceanController.getApplicationDetails";

// row actions
const actions = [
  // { label: "View", name: "View" },
  { label: "Edit", name: "Edit" }
  // { label: "Archive", name: "Archive" }
];
const COLS = [
  { label: "Ocean Request Id", fieldName: "OCEAN_REQUEST_ID__c", type: "text" },
  { label: "ADO Name", fieldName: "ADOName__c", type: "text" },
  { label: "Application Name", fieldName: "Application_Name__c", type: "text" },
  { label: "Project Name", fieldName: "ProjectName__c", type: "text" },
  { label: "AWS Account Name", fieldName: "AWSAccountName__c", type: "text" },
  {
    label: "Project Number",
    fieldName: "Cloud_Service_Provider_Project_Number__c",
    type: "text"
  },
  { label: "Status", fieldName: "Request_Status__c", type: "text" },
  { label: "Created Date", fieldName: "CreatedDate", type: "date" },
  { type: "action", typeAttributes: { rowActions: actions } }
];
export default class Ocean extends LightningElement {
  @track showRequestForm = false;
  @track btnAction = "";
  @track showLoadingSpinner;
  @track showRequests = false;
  @track showHome = true;
  @track requestType = "Draft";
  @track showNew = true;
  @track columns = COLS;
  @track oceanRequests;
  @track oceanRequestId;
  @track isAdoRequestor;
  @track currentOceanRequest;
  @track currentUserAccess;
  emptyFileUrl = EMPTY_FILE;

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    loadStyle(this, OCEAN_ASSETS_URL + "/css/styles.css");
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    registerListener("showOceanRequests", this.handleOceanRequests, this);
    registerListener("newRequest", this.handleRequestForms, this);
    if (this.oceanRequestId) {
      this.editMode = true;
    }
  }
  handleOceanRequests(input) {
    if (input !== "home") {
      this.requestType = input;
      this.getOceanRequestsByStatus();
    } else {
      this.oceanRequests = undefined;
      this.showRequestForm = false;
      this.showRequests = false;
      this.showLoadingSpinner = false;
      this.showHome = true;
    }
  }
  handleRequestForms(appDetails) {
    this.showRequestForm = false;
    this.showLoadingSpinner = true;
    this.currentOceanRequest = {
      applicationDetails: { id: appDetails.appId },
      requestStatus: "New",
      id: null,
      awsInstances: []
    };
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.handleRequest();
    }, 10);
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }
  getOceanRequestsByStatus() {
    if (this.requestType === "Draft") {
      this.btnAction = "Edit";
      this.getDrafts();
    } else if (this.requestType === "Approved") {
      this.btnAction = "View";
      this.getApproved();
    } else if (
      this.requestType !== "Draft" ||
      this.requestType !== "Approved"
    ) {
      this.btnAction = "View";
      this.getPending();
    }
  }
  getPending() {
    this.showLoadingSpinner = true;
    getSubmittedRequests()
      .then(result => {
        if (result && result.length > 0) {
          this.oceanRequests = result;
        } else {
          this.oceanRequests = undefined;
        }
        this.showRequestForm = false;
        this.showRequests = true;
        this.showHome = false;
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching pending ocean requests",
            message: error.message,
            variant: "error"
          })
        );
        this.showLoadingSpinner = false;
      });
  }

  getApproved() {
    this.showLoadingSpinner = true;
    getApprovedRequests()
      .then(result => {
        if (result && result.length > 0) {
          this.oceanRequests = result;
        } else {
          this.oceanRequests = undefined;
        }
        this.showRequestForm = false;
        this.showRequests = true;
        this.showHome = false;
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching approved ocean requests",
            message: error.message,
            variant: "error"
          })
        );
        this.showLoadingSpinner = false;
      });
  }

  getDrafts() {
    this.showLoadingSpinner = true;
    getDraftRequests()
      .then(result => {
        if (result && result.length > 0) {
          this.oceanRequests = result;
        } else {
          this.oceanRequests = undefined;
        }
        this.showRequestForm = false;
        this.showRequests = true;
        this.showHome = false;
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching draft ocean requests",
            message: error.message,
            variant: "error"
          })
        );
        this.showLoadingSpinner = false;
      });
  }

  viewRequest(event) {
    this.editCurrentRecord(event.target.value);
  }

  handleRowActions(event) {
    let actionName = event.detail.action.name;
    let row = event.detail.row;
    this.currentRequest = row.Id;
    // eslint-disable-next-line default-case
    switch (actionName) {
      case "View":
        this.viewCurrentRecord(row);
        break;
      case "Edit":
        this.editCurrentRecord(row);
        break;
      case "Delete":
        this.deleteInstance(row);
        break;
    }
  }
  // view the current record details
  viewCurrentRecord(currentRow) {
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = currentRow;
  }

  // closing modal box
  closeModal() {
    this.bShowModal = false;
  }
  editCurrentRecord(requestId) {
    this.currentOceanRequest = {
      applicationDetails: {},
      id: requestId
    };
    this.handleRequest();
  }

  // refreshing the datatable after record edit form success
  handleSuccess() {
    return refreshApex(this.refreshTable);
  }

  handleRequest() {
    this.showRequestForm = true;
    this.showHome = false;
    this.showRequests = false;
    this.showLoadingSpinner = false;
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Record Is  Deleted",
            variant: "success"
          })
        );
        this.updateTableData();
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While Deleting record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }
}
