/* eslint-disable no-console */
import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import getPendingRequests from "@salesforce/apex/OceanController.getPendingRequests";
import getApprovedRequests from "@salesforce/apex/OceanController.getApprovedRequests";
import getDraftRequests from "@salesforce/apex/OceanController.getDraftRequests";
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { loadStyle } from "lightning/platformResourceLoader";
import OCEAN_ASSETS_URL from "@salesforce/resourceUrl/ocean";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
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
  @track showRequestForm;
  @track btnAction = '';
  @track showLoadingSpinner;
  @track showRequests = false;
  @track showHome = true;
  @track requestType = 'Draft';
  @track showNew = true;
  @track columns = COLS;
  @track oceanRequests;
  @track oceanRequestId;
  @track isAdoRequestor;
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
    this.isAdoRequestor = (localStorage.getItem('isAdoRequestor') === 'true');
  }
  handleOceanRequests(input) {
    if(input !== 'home') {
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
    console.log(appDetails);
    if(localStorage.getItem('currentProjectDetails')) {
      this.currentProjectDetails = JSON.parse(localStorage.getItem('currentProjectDetails'));
    }
    this.showRequestForm = true;
    this.showHome = false;
    this.showRequests = false;
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }
  getOceanRequestsByStatus() {
    if (this.requestType === 'Draft') {
      this.btnAction = 'Edit';
      this.getDrafts();
    } else if (this.requestType === 'Approved') {
      this.btnAction = 'View';
      this.getApproved();
    } else if (this.requestType !== 'Draft' || this.requestType !== 'Approved' ){
      this.btnAction = 'View';
      this.getPending();
    }
  }
  getPending() {
   this.showLoadingSpinner = true;
    getPendingRequests()
      .then(result => {
       console.log('Requests: ' + JSON.stringify(this.oceanRequests));
        if (result && result.length > 0) {
          this.oceanRequests = result;
        }
        else {
          this.oceanRequests = undefined;
        }
        this.showRequestForm = false;
        this.showRequests = true;
        this.showHome = false;
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.dispatchEvent(new ShowToastEvent({
          title: "Error While fetching pending ocean requests",
          message: error.message,
          variant: "error"
        }));
        this.showLoadingSpinner = false;
      });
  }

  getApproved() {
   this.showLoadingSpinner = true;
    getApprovedRequests()
      .then(result => {
        if (result && result.length > 0) {
          this.oceanRequests = result;
        }
        else {
          this.oceanRequests = undefined;
        }
        this.showRequestForm = false;
        this.showRequests = true;
        this.showHome = false;
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.dispatchEvent(new ShowToastEvent({
          title: "Error While fetching approved ocean requests",
          message: error.message,
          variant: "error"
        }));
        this.showLoadingSpinner = false;
      });
  }

  getDrafts() {
   this.showLoadingSpinner = true;
    getDraftRequests()
      .then(result => {
        if (result && result.length > 0) {
          this.oceanRequests = result;
        }
        else {
          this.oceanRequests = undefined;
        }
        this.showRequestForm = false;
        this.showRequests = true;
        this.showHome = false;
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.dispatchEvent(new ShowToastEvent({
          title: "Error While fetching draft ocean requests",
          message: error.message,
          variant: "error"
        }));
        this.showLoadingSpinner = false;
      });
  }

  viewRequest(event) {
    // console.log('Event from click: 2 ' + JSON.stringify(event.target.value));
    let row =  this.oceanRequests.find(item => item.Id === event.target.value );
    this.currentRequest = row.Id;
    this.editCurrentRecord(row);
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
  editCurrentRecord(currentRow) {
    this.oceanRequestId = currentRow.Id;
    this.showRequestForm = true;
    this.showHome = false;
    this.showRequests = false;
  }

  // refreshing the datatable after record edit form success
  handleSuccess() {
    return refreshApex(this.refreshTable);
  }

  handleNewRequest() {
    console.log('New Request Event:');
    this.showRequestForm = true;
    this.showHome = false;
    this.showRequests = false;
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