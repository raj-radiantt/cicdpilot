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
import getLambdaRequestPrice from "@salesforce/apex/OceanAwsPricingData.getLambdaRequestPrice";
import getLambdaRequests from "@salesforce/apex/OceanController.getLambdaRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Lambda__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Lambda__c.Ocean_Request_Id__c";
import NUMBER_OF_EXECUTIONS_PER_MONTH_FIELD from "@salesforce/schema/Ocean_Lambda__c.Number_of_Executions_per_Month__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Lambda__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Lambda__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Lambda__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Lambda__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Lambda__c.Application_Component__c";
import ALLOCATED_MEMORY_MB_FIELD from "@salesforce/schema/Ocean_Lambda__c.Allocated_Memory_MB__c";
import EXECUTION_TIME_FIELD from "@salesforce/schema/Ocean_Lambda__c.Estimated_Execution_Time_ms__c";
import NUMBER_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Lambda__c.Number_of_Months_Requested__c";
import ESTIMATED_MONTHLY_COST_FIELD from "@salesforce/schema/Ocean_Lambda__c.Estimated_Monthly_Cost__c";
import TOTAL_ESTIMATED_COST_FIELD from "@salesforce/schema/Ocean_Lambda__c.Total_Estimated_Cost__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Lambda__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  Application_Component_FIELD,
  EXECUTION_TIME_FIELD,
  NUMBER_OF_MONTHS_FIELD,
  NUMBER_OF_EXECUTIONS_PER_MONTH_FIELD,
  ALLOCATED_MEMORY_MB_FIELD,
  ESTIMATED_MONTHLY_COST_FIELD,
  TOTAL_ESTIMATED_COST_FIELD,
  ADO_Notes_FIELD
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Clone", name: "Clone" },
  { label: "Remove", name: "Remove" }
];
const COLS2 = [
  { label: "Date", fieldName: "date" },
  { label: "Notes", fieldName: "notes", type: "note" }
];
const COLS = [
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Instance Id", fieldName: "Lambda_Request_Id__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  },
  {
    label: "Number of Months Requested",
    fieldName: "Number_of_Months_Requested__c",
    type: "number",
    cellAttributes: { alignment: "center" }
  },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanLambda extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @api isAdoRequestor;
  @api isReadonlyUser;
  @track showEc2Table = false;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track totalLambdaPrice = 0.0;
  @track lambdaInstances = [];
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

  handleLambdaComputeRowActions(event) {
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
    currentRow.Lambda_Request_Id__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createLambdaInstance(fields);
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
  handleLambdaSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveLambdaInstance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleLambdaComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Lambda instance has been removed",
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

  submitLambdaHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createLambdaInstance(fields);
  }

  createLambdaInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveLambdaInstance(fields);
  }
  saveLambdaInstance(fields) {
    var cost = 0;
    getLambdaRequestPrice({
      region: fields.AWS_Region__c
    })
      .then(result => {
        if (result) {
          result.forEach(r => {
            if (r.Unit__c === "Requests") {
              cost += Math.round(
                parseInt(fields.Number_of_Executions_per_Month__c, 10) *
                  parseFloat(r.PricePerUnit__c)
              );
            } else {
              let roundDuration =
                Math.ceil(
                  parseInt(fields.Estimated_Execution_Time_ms__c, 10) / 100
                ) * 100;
              roundDuration *= 0.001;
              let memoryInGB = parseFloat(fields.Allocated_Memory_MB__c) / 1024;
              cost += Math.round(
                parseInt(fields.Number_of_Executions_per_Month__c, 10) *
                  roundDuration * memoryInGB *
                  parseFloat(r.PricePerUnit__c)
              );
            }
          });
          cost *= parseInt(fields.Number_of_Months_Requested__c, 10);
          console.log(cost);
        }
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
        const recordInput = { apiName: "Ocean_Lambda__c", fields };
        if (this.currentRecordId) {
          this.updateLambdaRecord(recordInput, fields);
        } else {
          this.createLambdaRecord(recordInput, fields);
        }
      });
  }

  updateLambdaRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Lambda instance has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }
  createLambdaRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating Lambda record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getLambdaRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.lambdaInstances = result;
        this.rows = [];
        this.rows = this.lambdaInstances;
        if (this.lambdaInstances.length > 0) {
          this.showLambdaTable = true;
          this.totalLambdaPrice = 0;
          this.lambdaInstances.forEach(instance => {
            this.totalLambdaPrice += parseFloat(instance.Calculated_Cost__c);
          }); 
          this.fireLambdaPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.lambdaInstances = undefined;
      });
  }
  fireLambdaPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalLambdaPrice", this.totalLambdaPrice);
  }
  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}