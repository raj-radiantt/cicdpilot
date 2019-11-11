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
import { fireEvent } from "c/pubsub";
import getS3RequestPrice from "@salesforce/apex/OceanAwsPricingData.getS3RequestPrice";
import getS3Requests from "@salesforce/apex/OceanController.getS3Requests";
import ID_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_S3_Request__c.AWS_Region__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_S3_Request__c.AWS_Account_Name__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_S3_Request__c.ADO_Notes__c";
import APP_COMP_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Application_Component__c";
import DATA_RETRIEVAL_TYPE_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Data_Retrieval_Type__c";
import DATA_RETRIEVAL_GB_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Data_Retrieval_GBMonth__c";
import GETSELECT_FIELD from "@salesforce/schema/Ocean_S3_Request__c.GETSELECT_and_Other_Requests__c";
import LIFECYCLE_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Number_of_Lifecycle_Transition_Requests__c";
import NUM_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Number_of_Months_Requested__c";
import OBJ_MONITORED_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Objects_Monitored_per_Month__c";
import STORAGE_NOT_ACCESSED_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Storage_Not_Accessed_in_30_Days__c";
import PUTCOPY_FIELD from "@salesforce/schema/Ocean_S3_Request__c.PUTCOPYPOSTLIST_Requests__c";
import STORAGE_TYPE_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Storage_Type__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Calculated_Cost__c";
import TOTAL_STG_GB_MON_FIELD from "@salesforce/schema/Ocean_S3_Request__c.Total_Storage_GBMonth__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  DATA_RETRIEVAL_TYPE_FIELD,
  DATA_RETRIEVAL_GB_FIELD,
  GETSELECT_FIELD,
  LIFECYCLE_FIELD,
  NUM_OF_MONTHS_FIELD,
  OBJ_MONITORED_FIELD,
  STORAGE_NOT_ACCESSED_FIELD,
  PUTCOPY_FIELD,
  STORAGE_TYPE_FIELD,
  TOTAL_STG_GB_MON_FIELD,
  APP_COMP_FIELD,
  ADO_Notes_FIELD
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Clone", name: "Clone" },
  { label: "Remove", name: "Remove" }
];
const COLS = [
  { label: "Request Id", fieldName: "S3_Request_Id__c", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanS3Request extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showS3Table = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track s3Requests = [];
  s3InstanceTypes = [];
  @track totalS3Price = 0.0;

  @wire(CurrentPageReference) pageRef;

  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  // // non-reactive variables
  selectedRecords = [];
  refreshTable;
  error;
  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.updateTableData();
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
        this.editCurrentRecord();
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
  // view the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.S3_Request_Id__c = undefined;
    const fields = currentRow;
    this.createS3Instance(fields);
  }
  // closing modal box
  closeModal() {
    this.bShowModal = false;
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
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

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "S3 instance has been removed",
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

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
  }

  submitS3Handler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createS3Instance(fields);
  }

  createS3Instance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveS3Instance(fields);
  }
  saveS3Instance(fields) {
    var cost = 0;
    getS3RequestPrice({
      volumeType: fields.Storage_Type__c,
      region: fields.AWS_Region__c,
      storageSize: parseInt(parseInt(fields.Total_Storage_GBMonth__c, 10) / 1024, 10)
    })
      .then(result => {
        if (result) {
          cost = Math.round(parseFloat(result.PricePerUnit__c) * parseInt(fields.Number_of_Months_Requested__c, 10)
          * parseFloat(fields.Total_Storage_GBMonth__c));
        }
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
    updateRecord(recordInput)
      .then(() => {
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
        console.error("Error in updating  record : ", error);
      });
  }

  createS3Record(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating S3 compute record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getS3Requests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.s3Requests = result;
        this.rows = [];
        this.rows = this.s3Requests;
        if (this.s3Requests.length > 0) {
          this.showS3Table = true;
          this.totalS3Price = 0;
          this.s3Requests.forEach(instance => {
            this.totalS3Price += parseFloat(instance.Calculated_Cost__c);
          }); 
          this.fireS3Price();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.s3Requests = undefined;
      });
  }

  fireS3Price() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalS3RequestPrice", this.totalS3Price);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}
