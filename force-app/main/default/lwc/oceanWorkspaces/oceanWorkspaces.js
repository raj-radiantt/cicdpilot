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
import getWorkspaceRequestPrice from "@salesforce/apex/OceanAwsPricingData.getWorkspaceRequestPrice";
import getWorkspaceRequests from "@salesforce/apex/OceanController.getWorkspaceRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Environment__c";
import AWS_REGION_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.ADO_Notes__c";
import NO_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Number_of_Months_Requested__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Application_Component__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.AWS_Account_Name__c";
import ADDL_STG_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Additional_Storage_per_User_GB__c";
import BILL_OPTIONS_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Billing_Options__c";
import LICENSE_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.License__c";
import NO_OF_WORKSPACES_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Number_of_Workspaces__c";
import ROOT_VOL_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Root_Volume_User_Volume__c";
import BUNDLE_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Workspace_Bundle__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Workspaces_Request__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_REGION_FIELD,
  ADDL_STG_FIELD,
  NO_OF_MONTHS_FIELD,
  BILL_OPTIONS_FIELD,
  LICENSE_FIELD,
  NO_OF_WORKSPACES_FIELD,
  ROOT_VOL_FIELD,
  BUNDLE_FIELD,
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
  { label: "Request Id", fieldName: "Name", type: "text" },
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

export default class OceanWorkspaces extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showWorkspaceRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track workspaceRequests = [];
  @track totalWorkspaceRequestPrice = 0.0;
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

  handleWorkspaceRowActions(event) {
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
        this.deleteWorkspaceRequest(row);
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
    this.createWorkspaceRequest(fields);
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  handleWorkspaceSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveWorkspaceRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleWorkspaceSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteWorkspaceRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Workspace Request has been removed",
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

  submitWorkspaceHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createWorkspaceRequest(fields);
  }

  createWorkspaceRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveWorkspaceRequest(fields);
  }
  saveWorkspaceRequest(fields) {
    var cost = 0;
    getWorkspaceRequestPrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) {
          console.log( parseFloat(result.PricePerUnit__c) *
          parseInt(fields.Number_of_Months_Requested__c, 10) *
          parseInt(fields.Number_of_Workspaces__c, 10));
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) *
              parseInt(fields.Number_of_Months_Requested__c, 10) *
              parseInt(fields.Number_of_Workspaces__c, 10) *
              (result.Unit__c === "Hour" ? 730 : 1)
          );
        }
      })
      .catch(error => {
        console.log("Workspace Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Workspaces_Request__c", fields };
        if (this.currentRecordId) {
          this.updateDTRecord(recordInput, fields);
        } else {
          this.createDTRecord(recordInput);
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
            message: "Success! Workspace Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createDTRecord(recordInput) {
    createRecord(recordInput)
      .then(response => {
        recordInput.fields.Id = response.id;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating Workspace Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getWorkspaceRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.workspaceRequests = result;
        this.rows = [];
        this.rows = this.workspaceRequests;
        if (this.workspaceRequests.length > 0) {
          this.showWorkspaceRequestTable = true;
          this.totalWorkspaceRequestPrice = 0;
          this.workspaceRequests.forEach(instance => {
            this.totalWorkspaceRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
          this.fireWorkspaceRequestPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.workspaceRequests = undefined;
      });
  }

  getPricingRequestData(instance) {
    var params = instance.License__c.split(",").map(s => s.trim());
    return {
      pricingRequest: {
        billingOption: instance.Billing_Options__c,
        operatingSysytem: params[0],
        license: params[1],
        region: instance.AWS_Region__c,
        storage: instance.Root_Volume_User_Volume__c,
        bundle: instance.Workspace_Bundle__c
      }
    };
  }
  fireWorkspaceRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(
      this.pageRef,
      "totalWorkspaceRequestPrice",
      this.totalWorkspaceRequestPrice
    );
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}
