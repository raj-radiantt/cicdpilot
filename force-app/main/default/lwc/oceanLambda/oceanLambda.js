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
import getLambdaRequestPrice from "@salesforce/apex/OceanAwsPricingData.getLambdaRequestPrice";
import getLambdaRequests from "@salesforce/apex/OceanController.getLambdaRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Lambda__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Lambda__c.Ocean_Request_Id__c";
import NUMBER_OF_EXECUTIONS_PER_MONTH_FIELD from "@salesforce/schema/Ocean_Lambda__c.Number_of_Executions_per_Month__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Lambda__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Lambda__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Lambda__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_Lambda__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Lambda__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Lambda__c.Application_Component__c";
import ALLOCATED_MEMORY_MB_FIELD from "@salesforce/schema/Ocean_Lambda__c.Allocated_Memory_MB__c";
import EXECUTION_TIME_FIELD from "@salesforce/schema/Ocean_Lambda__c.Estimated_Execution_Time_ms__c";
import NUMBER_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Lambda__c.Number_of_Months_Requested__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Lambda__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  NUMBER_OF_EXECUTIONS_PER_MONTH_FIELD,
  EXECUTION_TIME_FIELD,
  ALLOCATED_MEMORY_MB_FIELD,
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

const COLS2 = [
  { label: "Date", fieldName: "date" },
  { label: "Notes", fieldName: "notes", type: "note" }
];

const COLS = [
  {label: "Request Id", fieldName: "Name", type: "text"},
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "No of Executions/month", fieldName: "Number_of_Executions_per_Month__c", type: "number",cellAttributes: { alignment: "left" } },
  {
    label: "Allocated Memory",
    fieldName: "Allocated_Memory_MB__c",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "App Component",
    fieldName: "Application_Component__c",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];

export default class OceanLambda extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;

  @track showLambdaTable = false;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track totalLambdaPrice = 0.0;
  @track lambdaInstances = [];
  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track pageNumber = 1;
  @track recordCount;
  @track pageCount;
  @track pages;
  @track showPagination;
  @track priceIsZero = false;
  @track showDeleteModal = false;

  // // non-reactive variables
  pageSize = 10;
  emptyFileUrl = EMPTY_FILE;
  selectedRecords = [];
  refreshTable;
  error;
  initialRender = true;

  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.initViewActions();
    this.updateTableData();
  }

  renderedCallback() {
    this.viewInit();
  }

  viewInit() {
    if (this.initialRender) {
      const pageElement = this.template.querySelector(
        '[data-id="page-buttons"]'
      );
      if (pageElement) {
        pageElement.classList.add("active-page");
        this.initialRender = false;
      }
    }
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

  handleLambdaComputeRowActions(event) {
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
        this.showDeleteModal = true;
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
    this.createLambdaInstance(fields);
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

  handleLambdaSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveLambdaInstance(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleLambdaComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  deleteInstance() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;  
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Lambda instance has been removed",
            variant: "success"
          })
        );
        this.pageNumber =
          (this.recordCount - 1) % this.pageSize === 0 ? 1 : this.pageNumber;
        if (this.pageNumber === 1) {
          const el = this.template.querySelector('[data-id="page-buttons"]');
          if (el) el.classList.add("active-page");
        }
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

  closePriceAlertModal() {
    this.priceIsZero = false;
  }

  closeDeleteModal(){
    this.showDeleteModal = false;
  }

  submitLambdaHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createLambdaInstance(fields);
  }

  createLambdaInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveLambdaInstance(fields);
  }

  saveLambdaInstance(fields) {
    var cost = 0;
    getLambdaRequestPrice({
      region: fields.AWS_Region__c
    })
      .then(result => {
        if (result) {
          result.forEach(r => {
            if (r.Unit__c === "Requests") {
              cost += Math.round(
                parseInt(fields.Number_of_Executions_per_Month__c, 10) *
                  parseFloat(r.PricePerUnit__c)
              );
            } else {
              let roundDuration =
                Math.ceil(
                  parseInt(fields.Estimated_Execution_Time_ms__c, 10) / 100
                ) * 100;
              roundDuration *= 0.001;
              let memoryInGB = parseFloat(fields.Allocated_Memory_MB__c) / 1024;
              cost += Math.round(
                parseInt(fields.Number_of_Executions_per_Month__c, 10) *
                  roundDuration * memoryInGB *
                  parseFloat(r.PricePerUnit__c)
              );
            }
          });
          cost *= parseInt(fields.Number_of_Months_Requested__c, 10);
        }
        if(cost === 0.00) {
          this.priceIsZero = true;
        }
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Lambda Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Lambda__c", fields };
        if (this.currentRecordId) {
          this.updateLambdaRecord(recordInput, fields);
        } else {
          this.createLambdaRecord(recordInput, fields);
        }
      });
  }

  updateLambdaRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Lambda instance has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }

  createLambdaRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Lambda instance has been created!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.showLoadingSpinner = false;
      });
  }

  getRecordPage(e) {
    const page = e.target.value;
    if (page) {
      this.toggleActiveClassForPage(e);
      this.pageNumber = page;
      this.updateTableData();
    }
  }

  toggleActiveClassForPage(e) {
    const id = e.target.dataset.id;
    this.template.querySelectorAll(`[data-id="${id}"]`).forEach(el => {
      el.classList.remove("active-page");
    });
    e.target.classList.add("active-page");
  }

  updateTableData() {
    this.constructPagination();
    getLambdaRequests({ 
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.lambdaInstances = result;
        this.rows = [];
        this.rows = this.lambdaInstances;
        this.showLambdaTable = this.lambdaInstances.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.lambdaInstances = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_Lambda__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalLambdaPrice = parseFloat(result.totalCost) || 0;
          this.recordCount = parseInt(result.recordCount, 10);
          this.pageCount = Math.ceil(this.recordCount / this.pageSize) || 1;
          this.pages = [];
          this.pageNumber =
            this.pageNumber > this.pageCount ? this.pageCount : this.pageNumber;
          let i = 1;
          // eslint-disable-next-line no-empty
          while (this.pages.push(i++) < this.pageCount) {}
          this.showPagination = this.pages.length > 1;
        }
      })
      .catch(error => this.dispatchEvent(showErrorToast(error)));
  }

  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}