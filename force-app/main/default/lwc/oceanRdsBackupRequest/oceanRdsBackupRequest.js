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
import getRdsBkupRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRdsBkupRequestPrice";
import getRdsBkupRequests from "@salesforce/apex/OceanController.getRdsBkupRequests";
import ID_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.AWS_Region__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.AWS_Account_Name__c";
import Environment_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Environment__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Resource_Status__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Number_of_Months_Requested__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Ocean_Request_Id__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Calculated_Cost__c";
import BKUP_STORAGE_TYPE_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Backup_Storage_Type__c";
import ADDL_STORAGE_TYPE_FIELD from "@salesforce/schema/Ocean_RDS_Backup_Request__c.Additional_Backup_Storage_GB_Per_Month__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  ADDL_STORAGE_TYPE_FIELD,
  BKUP_STORAGE_TYPE_FIELD,
  Number_Of_Months_FIELD,
  Application_Component_FIELD,
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
  {
    label: "Request Id",
    fieldName: "Ocean_RDS_Backup_Request_ID__c",
    type: "text"
  },
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

export default class OceanRdsBackupRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showRdsRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track rdsRequests = [];
  @track totalRdsBackupRequestPrice = 0.0;
  @track addNote = false;

  @wire(CurrentPageReference) pageRef;

  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  error;
  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.updateTableData();
  }

  handleRdsRequestRowActions(event) {
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
        this.deleteRdsRequest(row);
        break;
    }
  }
  // view the current record details
  viewCurrentRecord(currentRow) {
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = currentRow;
  }
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Ocean_RDS_Backup_Request_ID__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createRdsRequest(fields);
  }
  // closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  handleRdsRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveRdsRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleRdsRequestSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteRdsRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "RDS Request has been removed",
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
    fields[AWS_Account_Name_FIELD.fieldApiName] = this.selectedAwsAccount;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  submitRdsRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createRdsRequest(fields);
  }

  createRdsRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveRdsRequest(fields);
  }
  saveRdsRequest(fields) {
    var cost = 0;
    getRdsBkupRequestPrice({
      region: fields.AWS_Region__c,
      databaseEngine:
        fields.Backup_Storage_Type__c === "Standard Backup"
          ? ""
          : fields.Backup_Storage_Type__c
    })
      .then(result => {
        if (result) {
          console.log(result);         
          cost = parseFloat(result.PricePerUnit__c) * parseFloat(fields.Additional_Backup_Storage_GB_Per_Month__c) * parseInt(fields.Number_of_Months_Requested__c, 10);
        }
      })
      .catch(error => {
        console.log("RDS Request Price error: ", error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_RDS_Backup_Request__c", fields };
        if (this.currentRecordId) {
          this.updateRDSRecord(recordInput, fields);
        } else {
          this.createRDSRecord(recordInput, fields);
        }
      });
  }

  updateRDSRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! RDS Backup Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createRDSRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating RDS Backup Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getRdsBkupRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.rdsRequests = result;
        this.rows = [];
        this.rows = this.rdsRequests;
        if (this.rdsRequests.length > 0) {
          this.showRdsRequestTable = true;
          this.totalRdsBackupRequestPrice = 0;
          this.rdsRequests.forEach(instance => {
            this.totalRdsBackupRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
        }
        this.fireRdsRequestPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
  }

  fireRdsRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalRdsBackupRequestPrice", this.totalRdsBackupRequestPrice);
  }

  notesModel() {
    this.addNote = true;
  }

  handleCancelEdit() {
    this.bShowModal = false;
  }
}