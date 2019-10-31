/* eslint-disable no-console */
import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import getDraftRequests from "@salesforce/apex/OceanController.getDraftRequests";
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { loadStyle } from "lightning/platformResourceLoader";
import OCEAN_ASSETS_URL from "@salesforce/resourceUrl/ocean";
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
  @track showRequest = false;
  @track showHome = true;
  @track showNew = true;
  @track columns = COLS;
  @track draftRequests;
  @track oceanRequestId;
  @wire(getDraftRequests, { status: "Draft" })
  wiredResult(result, error) {
    if (result) {
      this.draftRequests = result;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.draftRequests = undefined;
    }
  }

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    loadStyle(this, OCEAN_ASSETS_URL + "/css/styles.css");
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    registerListener("showDraftRequests", this.handleDraftRequests, this);
    registerListener("showRequestForms", this.handleRequestForms, this);
    if (this.oceanRequestId) {
      this.editMode = true;
    }
  }
  handleDraftRequests() {
    this.showRequest = false;
  }

  handleRequestForms() {
    this.showRequest = true;
    this.showHome = false;
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
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
    this.showRequest = true;
    console.log('Editng current record: '+ this.oceanRequestId);
  }

  // handleing record edit form submit
  handleSubmit(event) {
    this.showLoadingSpinner = true;
    // prevending default type sumbit of record edit form
    event.preventDefault();
    this.saveEc2Instance(event.detail.fields);
    // closing modal
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleSuccess() {
    return refreshApex(this.refreshTable);
  }

  handleNewRequest() {
    this.showRequest = true;
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