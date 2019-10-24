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
import getEbsStoragePrice from "@salesforce/apex/OceanAwsPricingData.getEbsStoragePrice";
import getEbsStorages from "@salesforce/apex/OceanController.getEbsStorages";
import ID_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Resource_Status__c";
import CSP_OPTION_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.CSP_Option_Year__c";
import Project_Name_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Project_Name__c";
import Application_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Application__c";
import WAVE_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Wave_Submitted__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Environment__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.AWS_Account_Name__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Application_Component__c";
import EBS_Volume_TYPE_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Volume_Type__c";
import EST_MONTHLY_COST_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Estimated_Monthly_Cost__c";
import EST_COST_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Estimated_Cost__c";
import IOPS_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.IOPS__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Number_of_Months_Requested__c";
import NO_OF_VOL_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Number_of_Volumes__c";
import SNAPSHOT_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Snapshot_Storage_GB_Per_Month__c";
import STORAGE_SIZE_FIELD from "@salesforce/schema/Ocean_Ebs_Storage__c.Storage_Size_GB__c";

const COLS1 = [
  Resource_Status_FIELD,
  Project_Name_FIELD,
  Application_FIELD,
  Application_Component_FIELD,
  AWS_Account_Name_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  CSP_OPTION_FIELD,
  EBS_Volume_TYPE_FIELD,
  EST_MONTHLY_COST_FIELD,
  EST_COST_FIELD,
  IOPS_FIELD,
  NO_OF_MONTHS_FIELD,
  NO_OF_VOL_FIELD,
  SNAPSHOT_FIELD,
  STORAGE_SIZE_FIELD,
  WAVE_FIELD,
  ADO_Notes_FIELD,
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Remove", name: "Remove" }
];
const COLS = [
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Instance Id", fieldName: "EBS_Storage_Id__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Volume Type", fieldName: "Volume_Type__c", type: "text" },
  { label: "No Of Volumes",fieldName: "Number_of_Volumes__c",type: "number"},
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanEbsStorage extends LightningElement {
  @api oceanRequestId;
  @track showEbsStorgeTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track ebsStorages = [];
  @track totalEbsStoragePrice = 0.0;

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

  handleEbsStorageRowActions(event) {
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
        this.deleteEbsStorage(row);
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
  handleEbsStorageSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveEbsStorage(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleEbsStorageSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteEbsStorage(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Ebs Storage has been removed",
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

  submitEbsStorageHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.createEbsStorage(fields);
  }

  createEbsStorage(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveEbsStorage(fields);
  }
  saveEbsStorage(fields) {
    const recordInput = { apiName: "Ocean_Ebs_Storage__c", fields };
    if (this.currentRecordId) {
      delete recordInput.apiName;
      fields[ID_FIELD.fieldApiName] = this.currentRecordId;
      updateRecord(recordInput)
        .then(() => {
          this.updateTableData();
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success",
              message: "Success! Ebs Storage has been updated!",
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
              "Error in creating EBS Storage record for request id: [" +
                this.oceanRequestId +
                "]: ",
              error
            );
        });
    }
  }

  updateTableData() {
    getEbsStorages({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ebsStorages = result;
        if (this.ebsStorages.length > 0) {
          this.showEbsStorageTable = true;
        }
        // this.updateEbsStoragePrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.ebsStorages = undefined;
      });
    
  }
  updateEbsStoragePrice() {
    this.totalEbsStoragePrice = 0.0;
    this.ebsStorages.forEach((instance) => {
      /* getEbsStoragePrice({
      platform: instance.Platform__c,
      pricingModel: instance.ADO_FUNDING_TYPE__c,
      region: instance.AWS_Region__c,
      paymentOption: instance.paymentOption,
      reservationTerm: instance.reservationTerm
    }); */
    getEbsStoragePrice({
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
          this.fireEbsStoragePrice();
        }
      })
      .catch(error => {
        console.log("Ebs Storage Price error: " + error);
        this.error = error;
      });
    })
  }
  fireEbsStoragePrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalEbsStoragePrice", this.totalEbStoragePrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}