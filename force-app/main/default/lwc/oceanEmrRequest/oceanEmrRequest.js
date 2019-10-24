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
import ID_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.ADO_Notes__c";
import Application_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Application__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.AWS_Region__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.AWS_Account_Name__c";
import CSP_OPTION_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.CSP_Option_Year__c";
import Environment_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Environment__c";
import EST_MON_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Total_Estimated_Cost__c";
import FUNDING_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Funding_Type__c";
import INSTANCE_Q_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Instance_Quantity__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Number_of_Months_Requested__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Ocean_Request_Id__c";
import HADOOP_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Hadoop_Distribution__c";
import INSTANCE_TYPE_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Instance_Type__c";
import Project_Name_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Project_Name__c";
import UPTIME_MONTHS_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Uptime_DaysMonth__c";
import UPTIME_HRS_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Uptime_HoursDay__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Resource_Status__c";
import WAVE_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Wave_Submitted__c";
import TOTAL_COST_FIELD from "@salesforce/schema/Ocean_EMR_Request__c.Total_Estimated_Cost__c";
const COLS1 = [
  Resource_Status_FIELD,
  Project_Name_FIELD,
  AWS_Account_Name_FIELD,
  Application_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  CSP_OPTION_FIELD,
  HADOOP_FIELD,
  INSTANCE_TYPE_FIELD,
  INSTANCE_Q_FIELD,
  UPTIME_MONTHS_FIELD,
  Number_Of_Months_FIELD,
  UPTIME_HRS_FIELD,
  UPTIME_HRS_FIELD,
  EST_MON_FIELD,
  FUNDING_FIELD,
  TOTAL_COST_FIELD,
  WAVE_FIELD,
  ADO_Notes_FIELD,
  Application_Component_FIELD,
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Remove", name: "Remove" }
];
const COLS = [
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Request Id", fieldName: "EMR_Request_ID__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Instance Type", fieldName: "Instance_Type__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanEmrRequest extends LightningElement {
  @api oceanRequestId;
  @track showEmrRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track emrRequests = [];
  @track totalEmrPrice = 0.0;

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
  // closing modal box
  closeModal() {
    this.bShowModal = false;
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
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.createEmrRequest(fields);
  }

  createEmrRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveEmrRequest(fields);
  }
  saveEmrRequest(fields) {
    const recordInput = { apiName: "Ocean_EMR_Request__c", fields };
    if (this.currentRecordId) {
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
    } else {
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
  }

  updateTableData() {
    getEmrRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.emrRequests = result;
        this.rows = [];
        this.rows = this.emrRequests;
        if (this.emrRequests.length > 0) {
          this.showEmrRequestTable = true;
        }
        // this.updateEmrRequestPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.emrRequests = undefined;
      });
    
  }
  updateEmrRequestPrice() {
    this.totalEmrRequestPrice = 0.0;
    this.emrRequests.forEach((instance) => {
      /* getEmrRequestPrice({
      platform: instance.Platform__c,
      pricingModel: instance.ADO_FUNDING_TYPE__c,
      region: instance.AWS_Region__c,
      paymentOption: instance.paymentOption,
      reservationTerm: instance.reservationTerm
    }); */
    getEmrRequestPrice({
      platform: "RHEL",
      pricingModel: "Standard Reserved",
      region: "us-east-1",
      paymentOption: "No Upfront",
      reservationTerm: 1,
      instanceType: "a1.xlarge"
    })
      .then(result => {
        if (result) {
          this.totalEmrPrice = parseFloat(
            Math.round(
              parseFloat(result.OnDemand_hourly_cost__c) *
                parseInt(instance.PerInstanceUptimePerMonth__c, 10) *
                parseInt(instance.Instance_Quantity__c, 10)
            ) + parseFloat(this.totalEmrPrice)
          ).toFixed(2);
          this.fireEmrRequestPrice();
        }
      })
      .catch(error => {
        console.log("EMR Request Price error: " + error);
        this.error = error;
      });
    })
  }
  fireEmrRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalEmrRequestPrice", this.totalEbStoragePrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}