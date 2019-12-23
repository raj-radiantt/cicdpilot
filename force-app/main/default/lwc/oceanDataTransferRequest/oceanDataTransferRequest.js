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
import getDataTransferRequestPrice from "@salesforce/apex/OceanAwsPricingData.getDataTransferRequestPrice";
import getDataTransferRequests from "@salesforce/apex/OceanController.getDataTransferRequests";
import ID_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Application_Component__c";
import DATA_AMT_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Data_Transfer_Amount_GBMonth__c";
import DT_TYPE_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Data_Transfer_Type__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Number_of_Months_Requested__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  DT_TYPE_FIELD,
  DATA_AMT_FIELD,
  NO_OF_MONTHS_FIELD,
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
  { label: "Data Transfer Type", fieldName: "Data_Transfer_Type__c", type: "text" },
  { label: "Data Transfer Amount", fieldName: "Data_Transfer_Amount_GBMonth__c", type: "text" },
  { label: "App Component", fieldName: "Application_Component__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];

export default class OceanDataTransferRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  
  @track showDataTransferRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track dataTransferRequests = [];
  @track totalDataTransferRequestPrice = 0.0;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track pageNumber = 1;
  @track recordCount;
  @track pageCount;
  @track pages;
  @track showPagination;
  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;

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

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  handleDataTransferRowActions(event) {
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
        this.deleteDataTransferRequest(row);
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

  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createDataTransferRequest(fields);
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleDataTransferSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveDataTransferRequest(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleDataTransferSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteDataTransferRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "DataTransfer Request has been removed",
            variant: "success"
          })
        );
        this.pageNumber =
          (this.recordCount - 1) % this.pageSize === 0 ? 1 : this.pageNumber;
        if (this.pageNumber === 1) {
          this.template
            .querySelector('[data-id="page-buttons"]')
            .classList.add("active-page");
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

  submitDataTransferHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createDataTransferRequest(fields);
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createDataTransferRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveDataTransferRequest(fields);
  }

  saveDataTransferRequest(fields) {
    var cost = 0;
    getDataTransferRequestPrice({
      region: fields.AWS_Region__c,
      transferType: fields.Data_Transfer_Type__c
    })
      .then(result => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) * parseFloat(fields.Data_Transfer_Amount_GBMonth__c) *
              parseInt(fields.Number_of_Months_Requested__c, 10)
          );
        }
      })
      .catch(error => {
        console.log("DataTransfer Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = {
          apiName: "Ocean_DataTransfer_Request__c",
          fields
        };
        if (this.currentRecordId) {
          this.updateDTRecord(recordInput, fields);
        } else {
          this.createDTRecord(recordInput, fields);
        }
      });
  }

  updateDTRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    recordInput.fields = fields;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! DataTransfer Request has been updated!",
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

  createDTRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! DataTransfer instance has been created!",
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
    getDataTransferRequests({ 
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
     })
      .then(result => {
        this.dataTransferRequests = result;
        this.rows = [];
        this.rows = this.dataTransferRequests;
        this.showDataTransferRequestTable = this.dataTransferRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.ec2Instances = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_DataTransfer_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalDataTransferRequestPrice = parseFloat(result.totalCost) || 0;
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

  handleCancelEdit() {
    this.bShowModal = false;
  }
}