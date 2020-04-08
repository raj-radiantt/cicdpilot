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
import getElbRequestPrice from "@salesforce/apex/OceanAwsPricingData.getElbRequestPrice";
import getElbRequests from "@salesforce/apex/OceanController.getElbRequests";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Ocean_Request_Id__c";
import ID_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.AWS_Accounts__c";
import Environment_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Environment__c";
import DATA_PROCESSED_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Data_Processed_per_Load_Balancer__c";
import LB_TYPE_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Load_Balancing_Type__c";
import NO_OF_LB_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Number_Load_Balancers__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Number_of_Months_Requested__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Resource_Status__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  NO_OF_LB_FIELD,
  LB_TYPE_FIELD,
  DATA_PROCESSED_FIELD,
  Number_Of_Months_FIELD,
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
  { label: "Request Id", fieldName: "Name", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  {
    label: "Number of Load Balancers",
    fieldName: "Number_Load_Balancers__c",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  { label: "Type", fieldName: "Load_Balancing_Type__c", type: "text" },
  {
    label: "Data Processed",
    fieldName: "Data_Processed_per_Load_Balancer__c",
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

export default class OceanElbRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;

  @track showElbRequestTable = false;
  @track addNote = false;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track elbRequests = [];
  @track totalElbRequestPrice = 0;

  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track selectedAwsAccountLabel;
  @track pageNumber = 1;
  @track recordCount;
  @track pageCount;
  @track pages;
  @track showPagination;
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

  handleElbRequestRowActions(event) {
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
    this.createElbRequest(fields);
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleElbRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveElbRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleElbRequestSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteElbRequest() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;  
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Elb Request has been removed",
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

  submitElbRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createElbRequest(fields);
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createElbRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveElbRequest(fields);
  }

  saveElbRequest(fields) {
    var cost = 0;
    getElbRequestPrice({
      balancingType: fields.Load_Balancing_Type__c,
      region: fields.AWS_Region__c
    })
      .then(result => {
        if (result) {
          result.forEach(r => {
            cost +=
              r.Unit__c === "Hrs"
                ? 
                    parseFloat(r.PricePerUnit__c) *
                      730 *
                      parseInt(fields.Number_of_Months_Requested__c, 10) *
                      parseInt(fields.Number_Load_Balancers__c, 10)

                :  (parseFloat(fields.Data_Processed_per_Load_Balancer__c) *
                0.0013)* parseFloat(r.PricePerUnit__c) *
                  parseInt(fields.Number_of_Months_Requested__c, 10) *
                  parseInt(fields.Number_Load_Balancers__c, 10) *
                  730;
          });
        }
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "EC2 Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = Math.round(cost);
        const recordInput = { apiName: "Ocean_ELB_Request__c", fields };
        if (this.currentRecordId) {
          this.updateELBRecord(recordInput, fields);
        } else {
          this.createELBRecord(recordInput, fields);
        }
      });
  }

  updateELBRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        if(fields.Calculated_Cost__c === 0.00) {
          this.priceIsZero = true;
        }
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Elb Request has been updated!",
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

  createELBRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        if(fields.Calculated_Cost__c === 0.00) {
          this.priceIsZero = true;
        }
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! ELB instance has been created!",
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
    getElbRequests({
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.elbRequests = result;
        this.rows = [];
        this.rows = this.elbRequests;
        this.showElbRequestTable = this.elbRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.elbRequests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_ELB_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalElbRequestPrice = parseFloat(result.totalCost);
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