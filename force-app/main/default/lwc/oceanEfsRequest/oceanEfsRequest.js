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
import getEfsRequestPrice from "@salesforce/apex/OceanAwsPricingData.getEfsRequestPrice";
import getEfsRequests from "@salesforce/apex/OceanController.getEfsRequests";
import ID_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.AWS_Accounts__c";
import Environment_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Environment__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Number_of_Months_Requested__c";
import PROVISIONED_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Provisioned_Throughput_MBps__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Resource_Status__c";
import STORAGE_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Storage_Type__c";
import TOTAL_GB_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Total_Data_Storage_GBMonth__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Calculated_Cost__c";
import INFREQUENT_ACCESS_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Infrequent_Access_Requests_GB__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  STORAGE_FIELD,
  TOTAL_GB_FIELD,
  PROVISIONED_FIELD,
  INFREQUENT_ACCESS_FIELD,
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
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];

const COLS = [
  { label: "Request Id", fieldName: "Name", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" }, 
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Storage Type", fieldName: "Storage_Type__c", type: "text" },
  { label: "Total Storage", fieldName: "Total_Data_Storage_GBMonth__c", type: "text" },
  { label: "Provisioned Throughput", fieldName: "Provisioned_Throughput_MBps__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];

export default class OceanEfsRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @track showEfsRequestTable = false;
  @api currentOceanRequest;
  @api formMode;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track efsRequests = [];
  @track totalEfsRequestPrice = 0.0;
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

  handleEfsRequestRowActions(event) {
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
        this.deleteEfsRequest(row);
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
    this.createEfsRequest(fields);
  }
 
  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
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

  handleEfsRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveEfsRequest(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleEfsRequestSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteEfsRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Efs Request has been removed",
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

  submitEfsRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createEfsRequest(fields);
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createEfsRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveEfsRequest(fields);
  }

  saveEfsRequest(fields) {
    var cost = 0;
    getEfsRequestPrice({
      storageType: fields.Storage_Type__c,
      region: fields.AWS_Region__c
    }).then(result => {
        if (result) {
          cost = parseFloat(
            Math.round(
              parseFloat(result.PricePerUnit__c) *
                parseInt(fields.Total_Data_Storage_GBMonth__c, 10) *
                parseInt(fields.Number_of_Months_Requested__c, 10)
            )
          ).toFixed(2);
        }
      })
      .catch(error => {
        console.log("Efs Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_EFS_Request__c", fields };
        if (this.currentRecordId) {
          this.updateEFSRecord(recordInput, fields);
        } else {
          this.createEFSRecord(recordInput, fields);
        }
      });
  }

  createEFSRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! EFS instance has been created!",
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

  updateEFSRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Efs Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }
  updateTableData() {
    getCostAndCount({sObjectName: 'Ocean_EFS_Request__c', oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        if (result) {
          this.totalEfsRequestPrice = parseFloat(result.totalCost);
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

    getEfsRequests({
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.efsRequests = result;
        this.rows = [];
        this.rows = this.efsRequests;
        this.showEfsRequestTable = this.efsRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.efsRequests = null;
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