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
import getWorkspaceRequestPrice from "@salesforce/apex/OceanAwsPricingData.getWorkspaceRequestPrice";
import getWorkspaceRequests from "@salesforce/apex/OceanController.getWorkspaceRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Environment__c";
import AWS_REGION_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.ADO_Notes__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Number_of_Months_Requested__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Application_Component__c";
import ADDL_STG_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Additional_Storage_per_User_GB__c";
import BILL_OPTIONS_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Billing_Options__c";
import LICENSE_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.License__c";
import NO_OF_WORKSPACES_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Number_of_Workspaces__c";
import ROOT_VOL_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Root_Volume_User_Volume__c";
import BUNDLE_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Workspace_Bundle__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_REGION_FIELD,
  NO_OF_WORKSPACES_FIELD,
  BUNDLE_FIELD,
  LICENSE_FIELD,
  ROOT_VOL_FIELD,
  BILL_OPTIONS_FIELD,
  ADDL_STG_FIELD,
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
  { label: "No of Workspaces", fieldName: "Number_of_Workspaces__c", type: "number",cellAttributes: { alignment: "left" } },
  { label: "Workspace Bundle", fieldName: "Workspace_Bundle__c", type: "text" },
  { label: "License", fieldName: "License__c", type: "text" },
  { label: "Root Volume:User Volume", fieldName: "Root_Volume_User_Volume__c", type: "text" },
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

export default class OceanWorkspaces extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  @track showWorkspaceRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track workspaceRequests = [];
  @track totalWorkspaceRequestPrice = 0.0;
  @track selectedAwsAccount;
  @track record = [];
  @track bShowModal = false;
  @track showConfirm = false;
  @track priceIsZero = false;
  @track showDeleteModal = false;
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

  handleWorkspaceRowActions(event) {
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
    this.createWorkspaceRequest(fields);
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleWorkspaceSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveWorkspaceRequest(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleWorkspaceSuccess() {
    return refreshApex(this.refreshTable);
  }
  
  deleteWorkspaceRequest() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;  
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Workspace Request has been removed",
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

  submitWorkspaceHandler(event) {
    this.showConfirm = true;
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createWorkspaceRequest(fields);
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createWorkspaceRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveWorkspaceRequest(fields);
  }

  saveWorkspaceRequest(fields) {
    var cost = 0;
    getWorkspaceRequestPrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) *
              parseInt(fields.Number_of_Months_Requested__c, 10) *
              parseInt(fields.Number_of_Workspaces__c, 10) *
              (result.Unit__c === "Hour" ? 730 : 1)
          );          
        }
          if(cost === 0.00) {
            this.priceIsZero = true;
          }
      })
      .catch(error => {
        console.log("Workspace Request Price error: " + error);
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Workspaces_Request__c", fields };
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
            message: "Success! Workspace Request has been updated!",
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
            message: "Success! Workspace instance has been created!",
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
    getWorkspaceRequests({ 
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize 
    })
      .then(result => {
        this.workspaceRequests = result;
        this.rows = [];
        this.rows = this.workspaceRequests;
        this.showWorkspaceRequestTable = this.workspaceRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.workspaceRequests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_Workspaces_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalWorkspaceRequestPrice = parseFloat(result.totalCost) || 0;
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
    var params = instance.License__c.split(",").map(s => s.trim());
    return {
      pricingRequest: {
        billingOption: instance.Billing_Options__c,
        operatingSysytem: params[0],
        license: params[1],
        region: instance.AWS_Region__c,
        storage: instance.Root_Volume_User_Volume__c,
        bundle: instance.Workspace_Bundle__c
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