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
import getDataTransferRequestPrice from "@salesforce/apex/OceanAwsPricingData.getDataTransferRequestPrice";
import getDataTransferRequests from "@salesforce/apex/OceanController.getDataTransferRequests";
import ID_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Application_Component__c";
import DATA_AMT_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Data_Transfer_Amount_GBMonth__c";
import DT_TYPE_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Data_Transfer_Type__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Number_of_Months_Requested__c";
//import TOTAL_ESTIMATED_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Total_Estimated_Cost__c";
//import EST_MONTHLY_COST_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Estimated_Monthly_Cost__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.AWS_Account_Name__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_DataTransfer_Request__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  DATA_AMT_FIELD,
  DT_TYPE_FIELD,
  NO_OF_MONTHS_FIELD,
  //   TOTAL_ESTIMATED_FIELD,
  //   EST_MONTHLY_COST_FIELD,
  DT_TYPE_FIELD,
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
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Request Id", fieldName: "Name", type: "text" },
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

export default class OceanDataTransferRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @api isAdoRequestor;
  @api isReadonlyUser;
  @track showDataTransferRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track dataTransferRequests = [];
  @track totalDataTransferRequestPrice = 0.0;
  @track selectedAwsAccount;

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

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  handleDataTransferRowActions(event) {
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
        this.deleteDataTransferRequest(row);
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
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createDataTransferRequest(fields);
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  handleDataTransferSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveDataTransferRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleDataTransferSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteDataTransferRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "DataTransfer Request has been removed",
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

  submitDataTransferHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createDataTransferRequest(fields);
  }

  createDataTransferRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveDataTransferRequest(fields);
  }
  saveDataTransferRequest(fields) {
    var cost = 0;
    getDataTransferRequestPrice({
      region: fields.AWS_Region__c,
      transferType: fields.Data_Transfer_Type__c
    })
      .then(result => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) * parseFloat(fields.Data_Transfer_Amount_GBMonth__c) *
              parseInt(fields.Number_of_Months_Requested__c, 10)
          );
        }
      })
      .catch(error => {
        console.log("DataTransfer Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = {
          apiName: "Ocean_DataTransfer_Request__c",
          fields
        };
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
    recordInput.fields = fields;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! DataTransfer Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createDTRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating DataTransfer Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getDataTransferRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.dataTransferRequests = result;
        this.rows = [];
        this.rows = this.dataTransferRequests;
        if (this.dataTransferRequests.length > 0) {
          this.showDataTransferRequestTable = true;
          this.totalDataTransferRequestPrice = 0;
          this.dataTransferRequests.forEach(instance => {
            this.totalDataTransferRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
          this.fireDataTransferRequestPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.dataTransferRequests = undefined;
      });
  }


  fireDataTransferRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(
      this.pageRef,
      "totalDataTransferRequestPrice",
      this.totalDataTransferRequestPrice
    );
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}
