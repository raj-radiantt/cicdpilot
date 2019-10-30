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
import getRdsRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRdsRequestPrice";
import getRdsRequests from "@salesforce/apex/OceanController.getRdsRequests";
import ID_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.ADO_Notes__c";
import Application_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Application__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.AWS_Region__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.AWS_Account_Name__c";
import AWS_Availability_Zone_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.AWS_Availability_Zone__c";
import CSP_OPTION_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.CSP_Option_Year__c";
import DB_ENGINE_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.DB_Engine_License__c";
import DEPLOYMENT_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Deployment__c";
import Environment_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Environment__c";
import EST_MON_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Total_Estimated_Cost__c";
import FUNDING_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Funding_Type__c";
import INSTANCE_Q_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Instance_Quantity__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Number_of_Months_Requested__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Ocean_Request_Id__c";
import PER_UPTIME_MON_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Per_Instance_Uptime_DaysMonth__c";
import PER_UPTIME_DAY_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Per_Instance_Uptime_HoursDay__c";
import Project_Name_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Project_Name__c";
import PRO_IOPS_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Provisioned_IOPS__c";
import INSTANCE_TYPE_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Instance_Type__c";
import STORAGE_SIZE_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Storage_Size_GB__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Resource_Status__c";
import WAVE_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Wave_Submitted__c";
import TOTAL_COST_FIELD from "@salesforce/schema/Ocean_RDS_Request__c.Total_Estimated_Cost__c";
const COLS1 = [
  Resource_Status_FIELD,
  Project_Name_FIELD,
  AWS_Account_Name_FIELD,
  Application_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  AWS_Availability_Zone_FIELD,
  CSP_OPTION_FIELD,
  DB_ENGINE_FIELD,
  DEPLOYMENT_FIELD,
  EST_MON_FIELD,
  INSTANCE_Q_FIELD,
  Number_Of_Months_FIELD,
  PER_UPTIME_DAY_FIELD,
  PER_UPTIME_MON_FIELD,
  PRO_IOPS_FIELD,
  INSTANCE_TYPE_FIELD,
  STORAGE_SIZE_FIELD,
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
  { label: "Request Id", fieldName: "RDS_Request_Id__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Availability Zone", fieldName: "AWS_Availability_Zone__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanRdsRequest extends LightningElement {
  @api oceanRequestId;
  @track showRdsRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track rdsRequests = [];
  @track totalRdsRequestPrice = 0.0;

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
  // closing modal box
  closeModal() {
    this.bShowModal = false;
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

  submitRdsRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.createRdsRequest(fields);
  }

  createRdsRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveRdsRequest(fields);
  }
  saveRdsRequest(fields) {
    const recordInput = { apiName: "Ocean_RDS_Request__c", fields };
    if (this.currentRecordId) {
      delete recordInput.apiName;
      fields[ID_FIELD.fieldApiName] = this.currentRecordId;
      updateRecord(recordInput)
        .then(() => {
          this.updateTableData();
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success",
              message: "Success! RDS Request has been updated!",
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
              "Error in creating RDS Request record for request id: [" +
                this.oceanRequestId +
                "]: ",
              error
            );
        });
    }
  }

  updateTableData() {
    getRdsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.rdsRequests = result;
        this.rows = [];
        this.rows = this.rdsRequests;
        if (this.rdsRequests.length > 0) {
          this.showRdsRequestTable = true;
        }
        // this.updateRdsRequestPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    
  }
  updateRdsRequestPrice() {
    this.totalRdsRequestPrice = 0.0;
    this.rdsRequests.forEach((instance) => {
      /* getRdsRequestPrice({
      platform: instance.Platform__c,
      pricingModel: instance.ADO_FUNDING_TYPE__c,
      region: instance.AWS_Region__c,
      paymentOption: instance.paymentOption,
      reservationTerm: instance.reservationTerm
    }); */
    getRdsRequestPrice({
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
          this.fireRdsRequestPrice();
        }
      })
      .catch(error => {
        console.log("RDS Request Price error: " + error);
        this.error = error;
      });
    })
  }
  fireRdsRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalRdsRequestPrice", this.totalEbStoragePrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}