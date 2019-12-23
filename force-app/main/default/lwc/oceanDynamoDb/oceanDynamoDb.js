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
import getDynamoDBPrice from "@salesforce/apex/OceanAwsPricingData.getDynamoDBPrice";
import getDdbRequests from "@salesforce/apex/OceanController.getDdbRequests";
import ID_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.ADO_Notes__c";
import APP_COMP_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Application_Component__c";
import CAPACITY_TYPE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Capacity_Type__c";
import NO_OF_MON_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Number_of_Months_Requested__c";
import RESERVE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Reservation_Term__c";
import RD_CAPACITY_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Read_Capacity_Units_per_Month__c";
import RT_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Reservation_Term__c";
import WC_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Write_Capacity_Units_per_Month__c";
import TOTAL_STG_GB_MON_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Total_Data_Storage_GBMonth__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  APP_COMP_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  CAPACITY_TYPE_FIELD,
  TOTAL_STG_GB_MON_FIELD,
  RD_CAPACITY_FIELD,
  WC_FIELD,
  RT_FIELD,
  RESERVE_FIELD,
  NO_OF_MON_FIELD,
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
   {
   label: "Request Id",
   fieldName: "Name",
   type: "text"
   },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Capacity Type", fieldName: "Storage_Type__c", type: "text" },
  { label: "Total Data Storage", fieldName: "Total_Data_Storage_GBMonth__c", type: "text" },
  { label: "App Component", fieldName: "Application_Component__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  }
];

export default class OceanDynamoDBRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  @track showDdbTable = false;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track ddbRequests = [];
  @track totalDdbPrice = 0.0;
  awsAccountErrMessage = "Please select an AWS account";
  @track showAwsAccountErrMessage = false;
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

  handleDdbRowActions(event) {
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

// closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }

  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createDdbInstance(fields);
  }
  
  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleDdbSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveDdbInstance(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleDdbSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "DynamoDB request has been removed",
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

  submitDdbHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createDdbInstance(fields);
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createDdbInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveDdbInstance(fields);
  }

  saveDdbInstance(fields) {
    var cost = 0;
    getDynamoDBPrice(this.getPricingRequestData(fields))
      .then(result => {
        console.log(parseFloat(result));
        cost = Math.round(parseFloat(result));
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "DynamoDB Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_DynamoDB_Request__c", fields };
        if (this.currentRecordId) {
          this.updateDDBRecord(recordInput, fields);
        } else {
          this.createDDBRecord(recordInput, fields);
        }
      });
  }

  updateDDBRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! DynamoDB request has been updated!",
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

  createDDBRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! DynamoDB instance has been created!",
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
    getDdbRequests({ 
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.ddbRequests = result;
        this.rows = [];
        this.rows = this.ddbRequests;
        this.showDdbTable = this.ddbRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.ddbRequests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_DynamoDB_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalDdbPrice = parseFloat(result.totalCost) || 0;
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

  getPricingRequestData(instance) {
    var params = instance.Capacity_Type__c.split(",").map(s => s.trim());
    var [termType, leaseContractLength] = [
      params[0],
      params.length > 1 ? params[1] : ""
    ];
    return {
      pricingRequest: {
        readUnits: instance.Read_Capacity_Units_per_Month__c,
        dataStorage: instance.Total_Data_Storage_GBMonth__c,
        writeUnits: instance.Write_Capacity_Units_per_Month__c,
        region: instance.AWS_Region__c,
        numberOfMonths: instance.Number_of_Months_Requested__c,
        termType: termType,
        leaseContractLength: leaseContractLength,
      }
    };
  }

  handleCancelEdit() {
    this.bShowModal = false;
  }
}