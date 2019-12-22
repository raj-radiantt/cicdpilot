/* eslint-disable no-console */
import { LightningElement, track, wire, api } from "lwc";
import {
  createRecord,
  updateRecord,
  deleteRecord
} from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";
import { showErrorToast } from "c/oceanToastHandler";
import getQuickSightInstances from "@salesforce/apex/OceanController.getQuickSightRequests";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Ocean_Request_Id__c";
import ID_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Id";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Application_Component__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Calculated_Cost__c";
import NUMBER_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Number_of_Months_Requested__c";
import USER_TYPE_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.User_Type__c";
import NUMBER_OF_USERS_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.No_of_Users__c";
import SESSIONS_PER_USER_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.No_of_Sessions_per_UserMonth__c";
import SUBSCRIPTION_MODEL_FIELD from "@salesforce/schema/Ocean_QuickSight_Request__c.Subscription_Model__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  NUMBER_OF_USERS_FIELD,
  USER_TYPE_FIELD,
  SUBSCRIPTION_MODEL_FIELD,
  SESSIONS_PER_USER_FIELD,
  NUMBER_OF_MONTHS_FIELD, 
  ADO_Notes_FIELD
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Clone", name: "Clone" },
  { label: "Remove", name: "Remove" }
];

const readOnlyActions = [{ label: "View", name: "View" }];

const COLS = [
  { label: "Request Id", fieldName: "Name", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" }, 
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Number of users", fieldName: "No_of_Users__c", type: "text" },
  { label: "User Type", fieldName: "User_Type__c", type: "text" },
  { label: "Subscription Model", fieldName: "Subscription_Model__c", type: "text" },
  { label: "Sessions/User/Month", fieldName: "No_of_Sessions_per_UserMonth__c", type: "text" },
  { label: "App Component", fieldName: "Application_Component__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  }
];

const COLS2 = [
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];

export default class OceanQuickSightRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  @track showQuickSightTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track quickSightInstances = [];
  @track totalQuickSightPrice = 0.0;
  emptyFileUrl = EMPTY_FILE;

  @track record = [];
  @track bShowModal = false;
  @track addNote = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track pageNumber = 1;
  @track recordCount;
  @track pageCount;
  @track pages;

  pageSize = 10;
  emptyFileUrl = EMPTY_FILE;
  selectedRecords = [];
  refreshTable;
  error;

  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.initViewActions();
    this.updateTableData();
  }

  initViewActions() {
    this.columns = [...COLS];
    const userActions =
      this.formMode === "readonly" ? readOnlyActions : actions;
    //modify columns supplied to the form data table
    this.columns.push({
      type: "action",
      typeAttributes: { rowActions: userActions }
    });
  }

  handleQuickSightComputeRowActions(event) {
    let actionName = event.detail.action.name;
    let row = event.detail.row;
    this.currentRecordId = row.Id;
    // eslint-disable-next-line default-case
    switch (actionName) {
      case "View":
        this.viewCurrentRecord(row);
        break;
      case "Edit":
        this.editCurrentRecord(row);
        break;
      case "Clone":
        this.cloneCurrentRecord(row);
        break;
      case "Remove":
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

  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createQuickSightInstance(fields);
  }
  // closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleQuickSightComputeSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveQuickSightInstance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleQuickSightComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "QuickSight instance has been removed",
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

  submitQuickSightComputeHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createQuickSightInstance(fields);
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createQuickSightInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveQuickSightInstance(fields);
  }

  saveQuickSightInstance(fields) {
    fields[CALCULATED_COST_FIELD.fieldApiName] = this.getQuickSightCost(fields);
    const recordInput = { apiName: "Ocean_QuickSight_Request__c", fields };
    if (this.currentRecordId) {
      this.updateQuickSightRecord(recordInput, fields);
    } else {
      this.createQuickSightRecord(recordInput, fields);
    }
  }

  getQuickSightCost(fields) {
    var cost = 0;
    try {
      let subModel = fields.Subscription_Model__c.toLowerCase();
      let user = fields.User_Type__c.toLowerCase();
      const price = {
        enterprise: {
          author: 18,
          reader: 5,
          perGBCost: 0.38
        },
        standard: {
          author: 9,
          reader: 9,
          perGBCost: 0.25
        }
      };

      cost =
        parseInt(fields.No_of_Users__c, 10) *
        price[subModel][user] *
        parseInt(fields.Number_of_Months_Requested__c, 10);
    } catch (error) {
      cost = 0;
    }
    return cost;
  }

  updateQuickSightRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! QuickSight instance has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createQuickSightRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! QuickSight instance has been created!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.showLoadingSpinner = false;
      });
  }

  getRecordPage(e){
    const page = e.target.value;
    if(page){
      this.pageNumber = page;
      this.updateTableData();
    }
  }

  updateTableData() {
    getCostAndCount({sObjectName: 'Ocean_QuickSight_Request__c', oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        if (result) {
          this.totalQuickSightPrice = parseFloat(result.totalCost);
          this.recordCount = parseInt(result.recordCount, 10);
          this.pageCount = Math.ceil(this.recordCount / this.pageSize) || 1;
          this.pages = [];
          this.pageNumber = this.pageNumber > this.pageCount ? this.pageCount : this.pageNumber;
          console.log(this.pageNumber);
          let i = 1;
          // eslint-disable-next-line no-empty
          while(this.pages.push(i++) < this.pageCount){} 
        }
      })
      .catch(error => this.dispatchEvent(showErrorToast(error)));

    getQuickSightInstances({
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.quickSightInstances = result;
        this.rows = [];
        this.rows = this.quickSightInstances;
        this.showQuickSightTable = this.quickSightInstances.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.quickSightInstances = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  notesModel() {
    this.addNote = true;
  }

  handleCancelEdit() {
    this.bShowModal = false;
  }
}