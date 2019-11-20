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
import getDdbPrice from "@salesforce/apex/OceanAwsPricingData.getDdbPrice";
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
import RD_CON_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Read_Consistency__c";
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
  RD_CON_FIELD,
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
    fieldName: "Ocean_DynamoDB_Request_Id__c",
    type: "text"
  },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Cost", fieldName: "Calculated_Cost__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanDynamoDBRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showDdbTable = false;
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
  // view the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.InstanceID__c = undefined;
    const fields = currentRow;
    this.createDdbInstance(fields);
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

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  handleDdbSubmit(event) {
    const fields = event.detail.fields;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.showAwsAccountErrMessage = false;
    if (
      !this.selectedAwsAccount ||
      this.selectedAwsAccount === "" ||
      this.selectedAwsAccount === null
    ) {
      this.showAwsAccountErrMessage = true;
      return false;
    }
    event.preventDefault();
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveDdbInstance(fields);
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

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  submitDdbHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.saveDdbInstance(fields);
  }

  createDdbInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveDdbInstance(fields);
  }
  saveDdbInstance(fields) {
    var cost = 0;
    getDdbPrice({})
      .then(result => {
        console.log(result);
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
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    delete recordInput.apiName;
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
        }
        // this.updateDdbPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.ddbRequests = undefined;
      });
  }
  getPricingRequestData(instance) {
    var platforms = instance.Platform__c.split(",").map(s => s.trim());
    var [platform, preInstalledSW] = [
      platforms[0],
      platforms.length > 1 ? platforms[1] : ""
    ];
    var [offeringClass, termType, leaseContractLength, purchaseOption] = [
      "",
      "",
      "",
      ""
    ];
    var fundingTypes = instance.ADO_FUNDING_TYPE__c.split(",").map(s =>
      s.trim()
    );

    if (fundingTypes.length > 1) {
      [offeringClass, termType, leaseContractLength, purchaseOption] = [
        fundingTypes[0],
        fundingTypes[1],
        fundingTypes[2],
        fundingTypes[3]
      ];
    } else {
      termType = fundingTypes[0];
    }

    return {
      pricingRequest: {
        platform: platform,
        preInstalledSW: preInstalledSW,
        tenancy: instance.Tenancy__c,
        region: instance.AWS_Region__c,
        instanceType: instance.Ddb_Instance_Type__c,
        offeringClass: offeringClass,
        termType: termType,
        leaseContractLength: leaseContractLength,
        purchaseOption: purchaseOption
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
