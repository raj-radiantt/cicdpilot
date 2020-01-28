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
import getRedshiftRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRedshiftRequestPrice";
import getRedshiftRequests from "@salesforce/apex/OceanController.getRedshiftRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Environment__c";
import AWS_REGION_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.ADO_Notes__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Number_of_Months_Requested__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Application_Component__c";
import FNDNG_TYPE_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Funding_Type__c";
import NODE_QTY_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Node_Quantity__c";
import REDSHIFT_TYPE_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Redshift_Type__c";
import USAGE_PER_DAY_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Usage_Hours_Per_Day__c";
import USAGE_PER_MON_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Usage_Hours_Per_Month__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_REGION_FIELD,
  REDSHIFT_TYPE_FIELD,
  NODE_QTY_FIELD,
  USAGE_PER_DAY_FIELD,
  USAGE_PER_MON_FIELD,
  NO_OF_MONTHS_FIELD, 
  FNDNG_TYPE_FIELD, 
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
  { label: "Node Type", fieldName: "Redshift_Type__c", type: "text" },
  { label: "Node Quantity", fieldName: "Node_Quantity__c", type: "number",cellAttributes: { alignment: "left" } },
  { label: "Funding Type", fieldName: "Funding_Type__c", type: "text" },
  { label: "App Component", fieldName: "Application_Component__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];

const COLS2 = [
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];

export default class OceanRedshift extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;

  @track showRedshiftRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track redshiftRequests = [];
  @track totalRedshiftRequestPrice = 0.0;
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
  @track priceIsZero = false;
  @track showDeleteModal = false;

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

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  handleRedshiftRowActions(event) {
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

  // closing modal box
  closeModal() {
    this.bShowModal = false;
  }

  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createRedshiftRequest(fields);
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleRedshiftSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveRedshiftRequest(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleRedshiftSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteRedshiftRequest() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;  
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Redshift Request has been removed",
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

  submitRedshiftHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createRedshiftRequest(fields);
  }

  createRedshiftRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveRedshiftRequest(fields);
  }

  saveRedshiftRequest(fields) {
    var cost = 0;
    getRedshiftRequestPrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) {
          result.forEach(r => {
            cost +=
              r.Unit__c === "Quantity"
                ? this.scaleFloat(r.PricePerUnit__c) *
                  this.scaleInt(fields.Node_Quantity__c, 10)
                : this.scaleFloat(r.PricePerUnit__c) *
                  this.scaleFloat(fields.Usage_Hours_Per_Day__c) *
                  this.scaleInt(fields.Usage_Hours_Per_Month__c, 10) *
                  this.scaleInt(fields.Number_of_Months_Requested__c, 10) *
                  this.scaleInt(fields.Node_Quantity__c, 10);
          });
        }
        if(cost === 0.00) {
          this.priceIsZero = true;
        }
      })
      .catch(error => {
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Redshift_Request__c", fields };
        if (this.currentRecordId) {
          this.updateRedShiftRecord(recordInput, fields);
        } else {
          this.createRedshiftRecord(recordInput,fields);
        }
      });
   
  }

  updateRedShiftRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Redshift Request has been updated!",
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

  createRedshiftRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Redshift instance has been created!",
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
    getRedshiftRequests({
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.redshiftRequests = result;
        this.rows = [];
        this.rows = this.redshiftRequests;
        this.showRedshiftRequestTable = this.redshiftRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.redshiftRequests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({sObjectName: 'Ocean_Redshift_Request__c', oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        if (result) {
          this.totalRedshiftRequestPrice = parseFloat(result.totalCost);
          this.recordCount = parseInt(result.recordCount, 10);
          this.pageCount = Math.ceil(this.recordCount / this.pageSize) || 1;
          this.pages = [];
          this.pageNumber = this.pageNumber > this.pageCount ? this.pageCount : this.pageNumber;
          let i = 1;
          // eslint-disable-next-line no-empty
          while(this.pages.push(i++) < this.pageCount){} 
        }
      })
      .catch(error => this.dispatchEvent(showErrorToast(error)));
    }
    
  getPricingRequestData(instance) {   
    var [offeringClass, termType, leaseContractLength, purchaseOption] = ["","", "",""];
    var fundingTypes = instance.Funding_Type__c.split(",").map(s =>
      s.trim()
    );

    if (fundingTypes.length > 1) {
      [offeringClass, termType, leaseContractLength, purchaseOption] = [fundingTypes[0], fundingTypes[1], fundingTypes[2], fundingTypes[3]];
    } else {
      termType = fundingTypes[0];
    }

    return {
      pricingRequest: {
        region: instance.AWS_Region__c,
        instanceType: instance.Redshift_Type__c,
        offeringClass: offeringClass,
        termType: termType,
        leaseContractLength: leaseContractLength,
        purchaseOption: purchaseOption
      }
    };
  }

  handleCancelEdit() {
    this.bShowModal = false;
  }

  scaleInt(x, base){
    var parsed = parseInt(x, base);
    return isNaN(parsed) ? 1 : parsed;
  }

  scaleFloat(x){
    var parsed = parseFloat(x);
    return isNaN(parsed) ? 1 : parsed;
  }
}