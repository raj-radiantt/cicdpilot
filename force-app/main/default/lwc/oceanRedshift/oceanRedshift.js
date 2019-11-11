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
import getRedshiftRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRedshiftRequestPrice";
import getRedshiftRequests from "@salesforce/apex/OceanController.getRedshiftRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Environment__c";
import AWS_REGION_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.ADO_Notes__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Number_of_Months_Requested__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Application_Component__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.AWS_Account_Name__c";
import FNDNG_TYPE_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Funding_Type__c";
import NODE_QTY_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Node_Quantity__c";
import REDSHIFT_TYPE_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Redshift_Type__c";
import USAGE_PER_DAY_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Usage_Hours_Per_Day__c";
import USAGE_PER_MON_FIELD from "@salesforce/schema/Ocean_Redshift_Request__c.Usage_Hours_Per_Month__c";


const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_REGION_FIELD,
  REDSHIFT_TYPE_FIELD,
  NODE_QTY_FIELD,
  NO_OF_MONTHS_FIELD,
  USAGE_PER_DAY_FIELD,
  USAGE_PER_MON_FIELD,
  FNDNG_TYPE_FIELD,
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
  { label: "Request Id", fieldName: "Ocean_Redshift_Request_Id__c", type: "text" },
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

export default class OceanRedshift extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showRedshiftRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track redshiftRequests = [];
  @track totalRedshiftRequestPrice = 0.0;
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

  handleRedshiftRowActions(event) {
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
        this.deleteRedshiftRequest(row);
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
    this.createRedshiftRequest(fields);
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  handleRedshiftSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveRedshiftRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleRedshiftSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteRedshiftRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Redshift Request has been removed",
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

  submitRedshiftHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createRedshiftRequest(fields);
  }

  createRedshiftRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveRedshiftRequest(fields);
  }
  saveRedshiftRequest(fields) {
    //var cost = 0;
    // getRedshiftRequestPrice({
    //   region: fields.AWS_Region__c
    // })
    //   .then(result => {
    //     if (result) {
    //       cost = Math.round(parseFloat(result.PricePerUnit__c) * 8760 * parseInt(fields.Number_of_VPCs__c, 10));
    //     }
    //   })
    //   .catch(error => {
    //     console.log("Redshift Request Price error: " + error);
    //     this.error = error;
    //   })
    //   .finally(() => {
        
    //   });
    //fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
    const recordInput = { apiName: "Ocean_Redshift_Request__c", fields };
    if (this.currentRecordId) {
      this.updateRedShiftRecord(recordInput, fields);
    } else {
      this.createRedshiftRecord(recordInput);
    }
  }

  updateRedShiftRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    recordInput.fields = fields;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Redshift Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createRedshiftRecord(recordInput) {
    createRecord(recordInput)
      .then(() => {
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating Redshift Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getRedshiftRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.redshiftRequests = result;
        this.rows = [];
        this.rows = this.redshiftRequests;
        if (this.redshiftRequests.length > 0) {
          this.showRedshiftRequestTable = true;
          this.totalRedshiftRequestPrice = 0;
          this.redshiftRequests.forEach(instance => {
            this.totalRedshiftRequestPrice += parseFloat(instance.Calculated_Cost__c);
          }); 
          this.fireRedshiftRequestPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.redshiftRequests = undefined;
      });
  }

  updateRedshiftRequestPrice() {
    this.totalRedshiftRequestPrice = 0.0;
    this.redshiftRequests.forEach((instance) => {
      getRedshiftRequestPrice({
      "region": instance.AWS_Region__c,
    })
      .then(result => {
        if (result) {
          this.totalRedshiftRequestPrice = parseFloat(
            Math.round(
              parseFloat(result.PricePerUnit__c) *
                8640 *
                parseInt(instance.Number_of_VPCs__c, 10)
            ) + parseFloat(this.totalRedshiftRequestPrice)
          ).toFixed(2);
          this.fireRedshiftRequestPrice();
        }
      })
      .catch(error => {
        console.log("Redshift Request Price error: " + error);
        this.error = error;
      });
    })
  }

  fireRedshiftRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalRedshiftRequestPrice", this.totalRedshiftRequestPrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}