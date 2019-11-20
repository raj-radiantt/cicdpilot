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
import getEmrRequestPrice from "@salesforce/apex/OceanAwsPricingData.getEmrRequestPrice";
import getEmrRequests from "@salesforce/apex/OceanController.getEmrRequests";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.AWS_Account_Name__c";
import ID_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.AWS_Region__c";
import Environment_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Environment__c";
import FUNDING_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Funding_Type__c";
import INSTANCE_Q_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Instance_Quantity__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Number_of_Months_Requested__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Ocean_Request_Id__c";
import HADOOP_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Hadoop_Distribution__c";
import INSTANCE_TYPE_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Instance_Type__c";
import UPTIME_MONTHS_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Uptime_DaysMonth__c";
import UPTIME_HRS_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Uptime_HoursDay__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Resource_Status__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  HADOOP_FIELD,
  INSTANCE_TYPE_FIELD,
  INSTANCE_Q_FIELD,
  UPTIME_MONTHS_FIELD,
  Number_Of_Months_FIELD,
  UPTIME_HRS_FIELD,
  UPTIME_HRS_FIELD,
  FUNDING_FIELD,
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
const COLS2 = [
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];
const COLS = [
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Request Id", fieldName: "EMR_Request_ID__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Instance Type", fieldName: "Instance_Type__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanEmrRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showEmrRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track emrRequests = [];
  @track totalEmrRequestPrice = 0.0;
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

  handleEmrRequestRowActions(event) {
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
        this.deleteEmrRequest(row);
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
    currentRow.EMR_Request_ID__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createEmrRequest(fields);
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
  handleEmrRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveEmrRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleEmrRequestSuccess() {
    return refreshApex(this.refreshTable);
  }
 

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
    console.log('Selected AWS acccount: ' + this.selectedAwsAccount);
  }
  deleteEmrRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "EMR Request has been removed",
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

  submitEmrRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createEmrRequest(fields);
  }

  createEmrRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveEmrRequest(fields);
  }
  saveEmrRequest(fields) {
    var cost = 0;
    getEmrRequestPrice({
      region: fields.AWS_Region__c,
      hadoopDistributionType: fields.Hadoop_Distribution__c,
      instanceType: fields.Instance_Type__c
    })
      .then(result => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) *
              parseInt(fields.Uptime_HoursDay__c, 10) *
              parseInt(fields.Uptime_DaysMonth__c, 10) *
              parseInt(fields.Number_of_Months_Requested__c, 10) *
              parseInt(fields.Instance_Quantity__c, 10)
          );
        }
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "EMR Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_EMR_Request__c", fields };
        if (this.currentRecordId) this.updateEMRRecord(recordInput, fields);
        else this.createEMRRecord(recordInput, fields);
      });
  }

  updateEMRRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! EMR Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createEMRRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating EMR Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getEmrRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.emrRequests = result;
        this.rows = [];
        this.rows = this.emrRequests;
        if (this.emrRequests.length > 0) {
          this.showEmrRequestTable = true;
          this.totalEmrRequestPrice = 0;
          this.emrRequests.forEach(instance => {
            this.totalEmrRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
        }
        this.fireEmrRequestPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.emrRequests = undefined;
      });
  }

  fireEmrRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalEmrRequestPrice", this.totalEmrRequestPrice);
  }
  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}