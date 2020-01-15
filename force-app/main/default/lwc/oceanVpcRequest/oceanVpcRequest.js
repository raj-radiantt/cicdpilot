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
import getVpcRequestPrice from "@salesforce/apex/OceanAwsPricingData.getVpcRequestPrice";
import getVpcRequests from "@salesforce/apex/OceanController.getVpcRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Application_Component__c";
import Tenancy_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Tenancy__c";
import Number_Of_VPCS_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Number_of_VPCs__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  Number_Of_VPCS_FIELD,
  Tenancy_FIELD,
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
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  {label: "No of VPC's", fieldName: "Number_of_VPCs__c", type: "number",cellAttributes: { alignment: "left" }},
  { label: "Tenancy", fieldName: "Tenancy__c", type: "text" },
  {
    label: "App Component",
    fieldName: "Application_Component__c",
    type: "text",
    cellAttributes: { alignment: "left" }
  }
];

const COLS2 = [
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];

export default class OceanVpcRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  
  @track showVpcRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track vpcRequests = [];
  @track totalVpcRequestPrice = 0.0;
  @track selectedAwsAccount;
  @track addNote = false;
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

  handleVpcRowActions(event) {
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
        this.deleteVpcRequest(row);
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
    this.createVpcRequest(fields);
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleVpcSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveVpcRequest(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleVpcSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteVpcRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "VPC Request has been removed",
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

  submitVpcHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createVpcRequest(fields);
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createVpcRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveVpcRequest(fields);
  }

  saveVpcRequest(fields) {
    var cost = 0;
    getVpcRequestPrice({
      region: fields.AWS_Region__c
    })
      .then(result => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) *
              8760 *
              parseInt(fields.Number_of_VPCs__c, 10)
          );
        }
      })
      .catch(error => {
        console.log("VPC Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Vpc_Request__c", fields };
        if (this.currentRecordId) {
          this.updateVPCRecord(recordInput, fields);
        } else {
          this.createVPCRecord(recordInput, fields);
        }
      });
  }

  updateVPCRecord(recordInput, fields) {
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
            message: "Success! VPC Request has been updated!",
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

  createVPCRecord(recordInput,fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! VPC instance has been created!",
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
    getVpcRequests({ 
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.vpcRequests = result;
        this.rows = [];
        this.rows = this.vpcRequests;
        this.showVpcRequestTable = this.vpcRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.vpcRequests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_Vpc_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalVpcRequestPrice = parseFloat(result.totalCost) || 0;
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