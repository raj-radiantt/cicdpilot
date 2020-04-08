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
import getS3RequestPrice from "@salesforce/apex/OceanAwsPricingData.getS3RequestPrice";
import getS3Requests from "@salesforce/apex/OceanController.getS3Requests";
import ID_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_S3_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_S3_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_S3_Request__c.ADO_Notes__c";
import APP_COMP_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Application_Component__c";
import GETSELECT_FIELD from "@salesforce/schema/Ocean_S3_Request__c.GETSELECT_and_Other_Requests__c";
import NUM_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Number_of_Months_Requested__c";
import PUTCOPY_FIELD from "@salesforce/schema/Ocean_S3_Request__c.PUTCOPYPOSTLIST_Requests__c";
import STORAGE_TYPE_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Storage_Type__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Calculated_Cost__c";
import TOTAL_STG_GB_MON_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Total_Storage_GBMonth__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  APP_COMP_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  STORAGE_TYPE_FIELD,
  TOTAL_STG_GB_MON_FIELD,
  PUTCOPY_FIELD,
  GETSELECT_FIELD,
  NUM_OF_MONTHS_FIELD,
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
  { label: "Storage Type", fieldName: "Storage_Type__c", type: "text" },
  {
    label: "Total Storage",
    fieldName: "Total_Storage_GBMonth__c",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "PUT/COPY Requests",
    fieldName: "PUTCOPYPOSTLIST_Requests__c",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "GET/SELECT Requests",
    fieldName: "GETSELECT_and_Other_Requests__c",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Application Component",
    fieldName: "Application_Component__c",
    type: "text"
  },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];
const COLS2 = [
  { label: "Date", fieldName: "date" },
  { label: "Notes", fieldName: "notes", type: "note" }
];

export default class OceanS3Request extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;

  @track showS3Table = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track s3Requests = [];
  @track totalS3Price = 0;
  @track addNote = false;
  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track selectedAwsAccountLabel;
  @track pageNumber = 1;
  @track pageCount;
  @track recordCount;
  @track pages;
  @track showPagination;
  @track priceIsZero = false;
  @track showDeleteModal = false;

  // // non-reactive variables
  pageSize = 10;
  emptyFileUrl = EMPTY_FILE;
  selectedRecords = [];
  s3InstanceTypes = [];
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

  handleS3ComputeRowActions(event) {
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
    const awsAccountId = currentRow[AWS_ACCOUNT_FIELD.fieldApiName];
    this.selectedAwsAccountLabel = this.currentOceanRequest.applicationDetails.awsAccounts.filter(a => a.value === awsAccountId)[0].label;
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = currentRow;
  }

  // view the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createS3Instance(fields);
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

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  handleS3Submit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveS3Instance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleS3Success() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;  
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "S3 instance has been removed",
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

  submitS3Handler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createS3Instance(fields);
  }

  createS3Instance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveS3Instance(fields);
  }

  saveS3Instance(fields) {
    var cost = 0;
    getS3RequestPrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) cost = isNaN(parseFloat(result)) ? 0 : result.toFixed(2);
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "S3 Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_S3_Request__c", fields };
        if (this.currentRecordId) {
          this.updateS3Record(recordInput, fields);
        } else {
          this.createS3Record(recordInput, fields);
        }
      });
  }

  updateS3Record(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        if(fields.Calculated_Cost__c === '0.00') {
          this.priceIsZero = true;
        }
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! S3 instance has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(showErrorToast(error));
      });
  }

  createS3Record(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        if(fields.Calculated_Cost__c === '0.00') {
          this.priceIsZero = true;
        }
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! S3 storage has been created!",
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
    getS3Requests({
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.s3Requests = result;
        this.rows = [];
        this.rows = this.s3Requests;
        this.showS3Table = this.s3Requests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.s3Requests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_S3_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalS3Price = parseFloat(result.totalCost);
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
  getPricingRequestData(fields) {
    return {
      pricingRequest: {
        volumeType: fields.Storage_Type__c,
        region: fields.AWS_Region__c,
        noPutCopyListRequests: parseInt(fields.PUTCOPYPOSTLIST_Requests__c, 10),
        noGetRequests: parseInt(fields.GETSELECT_and_Other_Requests__c, 10),
        requestedMonths: parseInt(fields.Number_of_Months_Requested__c, 10),
        storageSize: parseInt(fields.Total_Storage_GBMonth__c, 10)
      }
    };
  }
  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}