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
import getVpcRequestPrice from "@salesforce/apex/OceanAwsPricingData.getVpcRequestPrice";
import getVpcRequests from "@salesforce/apex/OceanController.getVpcRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Application_Component__c";
import Tenancy_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Tenancy__c";
import Number_Of_VPCS_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Number_of_VPCs__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Calculated_Cost__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.AWS_Account_Name__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  Number_Of_VPCS_FIELD,
  Tenancy_FIELD,
  Application_Component_FIELD,
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
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Request Id", fieldName: "VPC_Request_Id__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Tenancy", fieldName: "Tenancy__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanVpcRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showVpcRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track vpcRequests = [];
  @track totalVpcRequestPrice = 0.0;
  @track selectedAwsAccount;
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

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  handleVpcRowActions(event) {
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
        this.deleteVpcRequest(row);
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
    currentRow.VPC_Request_Id__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createVpcRequest(fields);
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  handleVpcSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveVpcRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleVpcSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteVpcRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "VPC Request has been removed",
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

  submitVpcHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createVpcRequest(fields);
  }

  createVpcRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveVpcRequest(fields);
  }
  saveVpcRequest(fields) {
    var cost = 0;
    getVpcRequestPrice({
      region: fields.AWS_Region__c
    })
      .then(result => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) *
              8760 *
              parseInt(fields.Number_of_VPCs__c, 10)
          );
        }
      })
      .catch(error => {
        console.log("VPC Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_Vpc_Request__c", fields };
        if (this.currentRecordId) {
          this.updateVPCRecord(recordInput, fields);
        } else {
          this.createVPCRecord(recordInput);
        }
      });
  }

  updateVPCRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    recordInput.fields = fields;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! VPC Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createVPCRecord(recordInput) {
    createRecord(recordInput)
      .then(response => {
        recordInput.fields.Id = response.id;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating VPC Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getVpcRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.vpcRequests = result;
        this.rows = [];
        this.rows = this.vpcRequests;
        if (this.vpcRequests.length > 0) {
          this.showVpcRequestTable = true;
          this.totalVpcRequestPrice = 0;
          this.vpcRequests.forEach(instance => {
            this.totalVpcRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
          this.fireVpcRequestPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.vpcRequests = undefined;
      });
  }

  updateVpcRequestPrice() {
    this.totalVpcRequestPrice = 0.0;
    this.vpcRequests.forEach(instance => {
      getVpcRequestPrice({
        region: instance.AWS_Region__c
      })
        .then(result => {
          if (result) {
            this.totalVpcRequestPrice = parseFloat(
              Math.round(
                parseFloat(result.PricePerUnit__c) *
                  8640 *
                  parseInt(instance.Number_of_VPCs__c, 10)
              ) + parseFloat(this.totalVpcRequestPrice)
            ).toFixed(2);
            this.fireVpcRequestPrice();
          }
        })
        .catch(error => {
          console.log("VPC Request Price error: " + error);
          this.error = error;
        });
    });
  }

  fireVpcRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalVpcRequestPrice", this.totalVpcRequestPrice);
  }
  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}
