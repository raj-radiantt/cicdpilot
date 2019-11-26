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
import getDynamoDBPrice from "@salesforce/apex/OceanAwsPricingData.getDynamoDBPrice";
import getDdbRequests from "@salesforce/apex/OceanController.getDdbRequests";
import ID_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.AWS_Region__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.AWS_Account_Name__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.ADO_Notes__c";
import APP_COMP_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Application_Component__c";
import CAPACITY_TYPE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Capacity_Type__c";
import NO_OF_MON_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Number_of_Months_Requested__c";
import EST_MONTH_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Estimated_Monthly_Cost__c";
import RESERVE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Reservation_Term__c";
import RD_CAPACITY_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Read_Capacity_Units_per_Month__c";
import RT_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Reservation_Term__c";
import WC_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Write_Capacity_Units_per_Month__c";
import TOTAL_STG_GB_MON_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Total_Data_Storage_GBMonth__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  NO_OF_MON_FIELD,
  CAPACITY_TYPE_FIELD,
  RESERVE_FIELD,
  RD_CAPACITY_FIELD,
  TOTAL_STG_GB_MON_FIELD,
  RT_FIELD,
  WC_FIELD,
  EST_MONTH_FIELD,
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
  {
    label: "Request Id",
    fieldName: "Instance_Id__c",
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

export default class OceanDynamoDBRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
    @api isAdoRequestor;
  @api isReadonlyUser;
  @track showDdbTable = false;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track ddbRequests = [];
  @track totalDdbPrice = 0.0;
  awsAccountErrMessage = "Please select an AWS account";
  @track showAwsAccountErrMessage = false;
  @wire(CurrentPageReference) pageRef;

  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
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

  handleDdbRowActions(event) {
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
// closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Instance_Id__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createDdbInstance(fields);
  }
  
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  handleDdbSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    console.log(event.detail.fields);
    this.saveDdbInstance(event.detail.fields);
    this.bShowModal = false;
    return true;
  }
  // refreshing the datatable after record edit form success
  handleDdbSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "DynamoDB request has been removed",
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

  submitDdbHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createDdbInstance(fields);
  }

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  createDdbInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    console.log(fields);
    this.saveDdbInstance(fields);
  }
  saveDdbInstance(fields) {
    var cost = 0;
    getDynamoDBPrice(this.getPricingRequestData(fields))
      .then(result => {
        cost = Math.round(parseFloat(result));
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "DynamoDB Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_DynamoDB_Request__c", fields };
        if (this.currentRecordId) {
          this.updateDDBRecord(recordInput, fields);
        } else {
          this.createDDBRecord(recordInput, fields);
        }
      });
  }

  updateDDBRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! DynamoDB request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createDDBRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating DynamoDB record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getDdbRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ddbRequests = result;
        this.rows = [];
        this.rows = this.ddbRequests;
        if (this.ddbRequests.length > 0) {
          this.showDdbTable = true;
          this.totalDdbPrice = 0;
          this.ddbRequests.forEach(instance => {
            this.totalDdbPrice += parseFloat(instance.Calculated_Cost__c);
          }); 
          this.fireDdbPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.ddbRequests = undefined;
      });
  }
  getPricingRequestData(instance) {
    var params = instance.Capacity_Type__c.split(",").map(s => s.trim());
    var [termType, leaseContractLength] = [
      params[0],
      params.length > 1 ? params[1] : ""
    ];
    return {
      pricingRequest: {
        readUnits: instance.Read_Capacity_Units_per_Month__c,
        dataStorage: instance.Total_Data_Storage_GBMonth__c,
        writeUnits: instance.Write_Capacity_Units_per_Month__c,
        region: instance.AWS_Region__c,
        numberOfMonths: instance.Number_of_Months_Requested__c,
        termType: termType,
        leaseContractLength: leaseContractLength,
      }
    };
  }

  fireDdbPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalDdbRequestPrice", this.totalDdbPrice);
  }

  handleCancelEdit() {
    this.bShowModal = false;
  }
}