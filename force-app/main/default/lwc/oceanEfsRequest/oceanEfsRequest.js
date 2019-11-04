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
import getEfsRequestPrice from "@salesforce/apex/OceanAwsPricingData.getEfsRequestPrice";
import getEfsRequests from "@salesforce/apex/OceanController.getEfsRequests";
import ID_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.AWS_Region__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.AWS_Account_Name__c";
import Environment_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Environment__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Number_of_Months_Requested__c";
import PROVISIONED_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Provisioned_Throughput_MBps__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Resource_Status__c";
import STORAGE_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Storage_Type__c";
import TOTAL_GB_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Total_Data_Storage_GBMonth__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  AWS_Account_Name_FIELD,
  Environment_FIELD,
  Number_Of_Months_FIELD,
  AWS_Region_FIELD,
  STORAGE_FIELD,
  PROVISIONED_FIELD,
  TOTAL_GB_FIELD,
  ADO_Notes_FIELD,
  Application_Component_FIELD
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Remove", name: "Remove" }
];
const COLS = [
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Request Id", fieldName: "EFS_REQUEST_ID__c", type: "text" },
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

export default class OceanEfsRequest extends LightningElement {
  @api oceanRequestId;
  @track showEfsRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track efsRequests = [];
  @track totalEfsRequestPrice = 0.0;

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
        this.editCurrentRecord();
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
  // closing modal box
  closeModal() {
    this.bShowModal = false;
  }
  editCurrentRecord() {
    // open modal box
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
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.createEfsRequest(fields);
  }

  createEfsRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
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
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating Efs Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateEFSRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
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
    getEfsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.efsRequests = result;
        this.rows = [];
        this.rows = this.efsRequests;
        if (this.efsRequests.length > 0) {
          this.showEfsRequestTable = true;
          this.totalEfsRequestPrice = 0;
          this.efsRequests.forEach(instance => {
            this.totalEfsRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
          this.fireEfsRequestPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.efsRequests = undefined;
        this.showLoadingSpinner = false;
      });
  }

  fireEfsRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalEfsRequestPrice", this.totalEfsRequestPrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}
