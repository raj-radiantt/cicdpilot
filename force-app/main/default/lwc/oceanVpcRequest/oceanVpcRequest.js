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
import CSP_OPTION_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.CSP_Option_Year__c";
import Project_Name_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Project_Name__c";
import Application_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Application__c";
import WAVE_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Wave_Submitted__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.AWS_Account_Name__c";
import Environment_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Application_Component__c";
import Tenancy_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Tenancy__c";
import Number_Of_VPCS_FIELD from "@salesforce/schema/Ocean_Vpc_Request__c.Number_of_VPCs__c";

const COLS1 = [
  Resource_Status_FIELD,
  Project_Name_FIELD,
  AWS_Account_Name_FIELD,
  Application_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  CSP_OPTION_FIELD,
  Number_Of_VPCS_FIELD,
  Tenancy_FIELD,
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
  { label: "Request Id", fieldName: "VPC_Request_Id__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Tenancy", fieldName: "Tenancy__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanVpcRequest extends LightningElement {
  @api oceanRequestId;
  @track showVpcRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track vpcRequests = [];
  @track totalVpcRequestPrice = 0.0;

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

  handleVpcRequestRowActions(event) {
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
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  handleVpcRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveVpcRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleVpcRequestSuccess() {
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

  submitVpcRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.createVpcRequest(fields);
  }

  createVpcRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveVpcRequest(fields);
  }
  saveVpcRequest(fields) {
    const recordInput = { apiName: "Ocean_Vpc_Request__c", fields };
    if (this.currentRecordId) {
      delete recordInput.apiName;
      fields[ID_FIELD.fieldApiName] = this.currentRecordId;
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
              "Error in creating VPC Request record for request id: [" +
                this.oceanRequestId +
                "]: ",
              error
            );
        });
    }
  }

  updateTableData() {
    getVpcRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.vpcRequests = result;
        this.rows = [];
        this.rows = this.vpcRequests;
        if (this.vpcRequests.length > 0) {
          this.showVpcRequestTable = true;
        }
        this.updateVpcRequestPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.vpcRequests = undefined;
      });
    
  }
  updateVpcRequestPrice() {
    this.totalVpcRequestPrice = 0.0;
    this.vpcRequests.forEach((instance) => {
      getVpcRequestPrice({
      "region": instance.AWS_Region__c,
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
    })
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
  handleCancelEdit() {
    this.bShowModal = false;
  }
}