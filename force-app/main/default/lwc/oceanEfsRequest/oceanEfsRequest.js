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
import Application_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Application__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.AWS_Region__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.AWS_Account_Name__c";
import CSP_OPTION_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.CSP_Option_Year__c";
import Environment_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Environment__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Number_of_Months_Requested__c";
import PROVISIONED_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Provisioned_Throughput_MBps__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Ocean_Request_Id__c";
import Project_Name_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Project_Name__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Resource_Status__c";
import STORAGE_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Storage_Type__c";
import WAVE_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Wave_Submitted__c";
import TOTAL_GB_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Total_Data_Storage_GBMonth__c";
import TOTAL_COST_FIELD from "@salesforce/schema/Ocean_EFS_Request__c.Total_Estimated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Project_Name_FIELD,
  AWS_Account_Name_FIELD,
  Application_FIELD,
  Environment_FIELD,
  Number_Of_Months_FIELD,
  AWS_Region_FIELD,
  CSP_OPTION_FIELD,
  STORAGE_FIELD,
  PROVISIONED_FIELD,
  TOTAL_GB_FIELD,
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
  { label: "Request Id", fieldName: "EFS_REQUEST_ID__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
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
    console.log('View Record: ' + JSON.stringify(this.record));
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
    console.log('Edit Record: ' + JSON.stringify(event.detail.fields));
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
    const recordInput = { apiName: "Ocean_EFS_Request__c", fields };
    if (this.currentRecordId) {
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
    } else {
      console.log('Inside save: ' + JSON.stringify(recordInput));
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
  }

  updateTableData() {
    getEfsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.efsRequests = result;
        this.rows = [];
        this.rows = this.efsRequests;
        if (this.efsRequests.length > 0) {
          this.showEfsRequestTable = true;
        }
        // this.updateEfsRequestPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.efsRequests = undefined;
      });
    
  }
  updateEfsRequestPrice() {
    this.totalEfsRequestPrice = 0.0;
    this.efsRequests.forEach((instance) => {
      /* getEfsRequestPrice({
      platform: instance.Platform__c,
      pricingModel: instance.ADO_FUNDING_TYPE__c,
      region: instance.AWS_Region__c,
      paymentOption: instance.paymentOption,
      reservationTerm: instance.reservationTerm
    }); */
    getEfsRequestPrice({
      platform: "RHEL",
      pricingModel: "Standard Reserved",
      region: "us-east-1",
      paymentOption: "No Upfront",
      reservationTerm: 1,
      instanceType: "a1.xlarge"
    })
      .then(result => {
        if (result) {
          this.totalEbStoragePrice = parseFloat(
            Math.round(
              parseFloat(result.OnDemand_hourly_cost__c) *
                parseInt(instance.PerInstanceUptimePerMonth__c, 10) *
                parseInt(instance.Instance_Quantity__c, 10)
            ) + parseFloat(this.totalEbStoragePrice)
          ).toFixed(2);
          this.fireEfsRequestPrice();
        }
      })
      .catch(error => {
        console.log("Efs Request Price error: " + error);
        this.error = error;
      });
    })
  }
  fireEfsRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalEfsRequestPrice", this.totalEbStoragePrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}
