/* eslint-disable no-console */
import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import getDraftRequests from "@salesforce/apex/OceanAllRequests.getDraftRequests";
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
// row actions
const actions = [
  { label: "Record Details", name: "record_details" },
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];
const COLS = [
  { label: "ADO Name", fieldName: "ADOName__c", type: "text" },
  { label: "Application Name", fieldName: "Application_Name__c", type: "text" },
  { label: "Project Name", fieldName: "ProjectName__c", type: "text" },
  { label: "AWS Account Name", fieldName: "AWSAccountName__c", type: "text" },
  { label: "AWS Instances", fieldName: "AWSInstances__c", type: "text" },
  {
    label: "Project Number",
    fieldName: "Cloud_Service_Provider_Project_Number__c",
    type: "text"
  },
  { label: "PoP", fieldName: "PeriodOfPerformance__c", type: "number" },
  { label: "Status", fieldName: "Request_Status__c", type: "text" },
  { label: "Created Date", fieldName: "CreatedDate", type: "date" },
  { type: "action", typeAttributes: { rowActions: actions } }
];
export default class Ocean extends LightningElement {
  @track showRequest = false;
  @track showHome = true;
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
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    registerListener("showDraftRequests", this.handleDraftRequests, this);
    if (this.oceanRequestId) {
      this.editMode = true;
    }
  }
  handleDraftRequests() {
    this.showRequest = false;
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
      case "record_details":
        this.viewCurrentRecord(row);
        break;
      case "edit":
        this.editCurrentRecord(row);
        break;
      case "delete":
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
  handleNewRequest() {
    this.showRequest = true;
  }

  editCurrentRecord(currentRow) {
    this.oceanRequestId = currentRow.Id;
    this.showRequest = true;
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
