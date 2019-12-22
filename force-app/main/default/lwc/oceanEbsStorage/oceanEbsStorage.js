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
import getEbsStoragePrice from "@salesforce/apex/OceanAwsPricingData.getEbsStoragePrice";
import getEbsStorages from "@salesforce/apex/OceanController.getEbsStorages";
import ID_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.AWS_Region__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.AWS_Accounts__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Application_Component__c";
import EBS_Volume_TYPE_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Volume_Type__c";
import IOPS_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.IOPS__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Number_of_Months_Requested__c";
import NO_OF_VOL_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Number_of_Volumes__c";
import SNAPSHOT_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Snapshot_Storage_GB_Per_Month__c";
import STORAGE_SIZE_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Storage_Size_GB__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Calculated_Cost__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  NO_OF_VOL_FIELD,
  EBS_Volume_TYPE_FIELD,
  STORAGE_SIZE_FIELD,
  IOPS_FIELD,
  SNAPSHOT_FIELD,
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

const COLS2 = [
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];
const COLS = [
  {label: "Request ID", fieldName: "Name", type: "text"},
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Volume Type", fieldName: "Volume_Type__c", type: "text" },
  { label: "No Of Volumes", fieldName: "Number_of_Volumes__c", type: "number" },
  { label: "Storage Size", fieldName: "Storage_Size_GB__c", type: "text"},
  { label: "IOPS", fieldName: "IOPS__c", type: "number"},
  {label: "Application Component", fieldName: "Application_Component__c", type: "text"},
  { label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency"
  }
];

export default class OceanEbsStorage extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @track showEbsStorgeTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2
  @track ebsStorages = [];
  @track totalEbsStoragePrice = 0.0;
  @api formMode;
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

  handleEbsStorageRowActions(event) {
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
        this.deleteEbsStorage(row);
        break;
    }
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  
  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createEbsStorage(fields);
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

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleEbsStorageSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveEbsStorage(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleEbsStorageSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteEbsStorage(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Ebs Storage has been removed",
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

  submitEbsStorageHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createEbsStorage(fields);
  }

  createEbsStorage(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveEbsStorage(fields);
  }
  saveEbsStorage(fields) {
    var cost = 0;
    getEbsStoragePrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) {
          cost = parseFloat(
            Math.round(
                parseFloat(result.PricePerUnit__c) *
                parseInt(fields.Number_of_Volumes__c, 10) *
                parseFloat(fields.Storage_Size_GB__c) *
                parseInt(fields.Number_of_Months_Requested__c, 10))
          ).toFixed(2);
        }
      })
      .catch(error => {
        console.log("EBS price error", error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Ebs_Storage__c", fields };
        if (this.currentRecordId) {
          delete recordInput.apiName;
          fields[ID_FIELD.fieldApiName] = this.currentRecordId;
          this.updateEBSRecord(recordInput);
        } else {
          this.createEBSRecord(recordInput, fields);
        }
      });
  }

  updateEBSRecord(recordInput,fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Ebs Storage has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createEBSRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! EBS storage has been created!",
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
    getCostAndCount({sObjectName: 'Ocean_Ebs_Storage__c', oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        if (result) {
          this.totalEbsStoragePrice = parseFloat(result.totalCost);
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

  getEbsStorages({
    oceanRequestId: this.currentOceanRequest.id,
    pageNumber: this.pageNumber,
    pageSize: this.pageSize
  })
    .then(result => {
      this.ebsStorages = result;
      this.rows = [];
      this.rows = this.ebsStorages;
      this.showEbsStorgeTable = this.ebsStorages.length > 0;
    })
    .catch(error => {
      this.dispatchEvent(showErrorToast(error));
      this.ebsStorages = null;
    })
    .finally(() => {
      this.showLoadingSpinner = false;
    });
}
  
  
  getPricingRequestData(instance) {
    var types = instance.Volume_Type__c.split(",").map(s => s.trim());
    var [volumeType, storageMedia] = [types[0], types[1]];
    return {
      volumeType: volumeType,
      storageMedia: storageMedia,
      region: instance.AWS_Region__c
    };
  }

  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}