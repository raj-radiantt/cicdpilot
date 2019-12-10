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
import getElbRequestPrice from "@salesforce/apex/OceanAwsPricingData.getElbRequestPrice";
import getElbRequests from "@salesforce/apex/OceanController.getElbRequests";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Ocean_Request_Id__c";
import ID_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.ADO_Notes__c";
import Application_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Application__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.AWS_Region__c";
import Environment_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Environment__c";
import DATA_PROCESSED_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Data_Processed_per_Load_Balancer__c";
import LB_TYPE_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Load_Balancing_Type__c";
import NO_OF_LB_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Number_Load_Balancers__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Number_of_Months_Requested__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Resource_Status__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_ELB_Request__c.Calculated_Cost__c";

const COLS1 = [
  Resource_Status_FIELD,
  Application_FIELD,
  Environment_FIELD,
  DATA_PROCESSED_FIELD,
  NO_OF_LB_FIELD,
  LB_TYPE_FIELD,
  Number_Of_Months_FIELD,
  AWS_Region_FIELD,
  ADO_Notes_FIELD,
  Application_Component_FIELD
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
  { label: "Request Id", fieldName: "ELB_Request_ID__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Type", fieldName: "Load_Balancing_Type__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanElbRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
    @api isAdoRequestor;
  @api isReadonlyUser;
  @track showElbRequestTable = false;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track elbRequests = [];
  @track totalElbRequestPrice = 0.0;

  @wire(CurrentPageReference) pageRef;

  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  error;
  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.updateTableData();
  }

  handleElbRequestRowActions(event) {
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
        this.deleteElbRequest(row);
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
    currentRow.ELB_Request_ID__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createElbRequest(fields);
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  handleElbRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveElbRequest(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleElbRequestSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteElbRequest(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Elb Request has been removed",
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

  submitElbRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createElbRequest(fields);
  }

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  createElbRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveElbRequest(fields);
  }
  saveElbRequest(fields) {
    var cost = 0;
    getElbRequestPrice({
      balancingType: fields.Load_Balancing_Type__c,
      region: fields.AWS_Region__c
    })
      .then(result => {
        if (result) {
          result.forEach(r => {
            cost +=
              r.Unit__c === "Hrs"
                ? Math.round(
                    parseFloat(r.PricePerUnit__c) *
                      730 *
                      parseInt(fields.Number_of_Months_Requested__c, 10) *
                      parseInt(fields.Number_Load_Balancers__c, 10)
                  )
                : Math.round(
                    parseFloat(r.PricePerUnit__c) *
                      parseFloat(fields.Data_Processed_per_Load_Balancer__c) * 730 *
                      parseInt(fields.Number_of_Months_Requested__c, 10) *
                      parseInt(fields.Number_Load_Balancers__c, 10)
                  );
          });
        }
      })
      .catch(error => {
        console.log("Elb Request Price error: " + error);
        this.error = error;
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "Ocean_ELB_Request__c", fields };
        if (this.currentRecordId) {
          this.updateELBRecord(recordInput, fields);
        } else {
          this.createELBRecord(recordInput, fields);
        }
      });
  }

  updateELBRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Elb Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        console.error("Error in updating  record : ", error);
      });
  }

  createELBRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.oceanRequestId;
        this.updateTableData();
      })
      .catch(error => {
        if (error)
          console.error(
            "Error in creating Elb Request record for request id: [" +
              this.oceanRequestId +
              "]: ",
            error
          );
      });
  }

  updateTableData() {
    getElbRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.elbRequests = result;
        this.rows = [];
        this.rows = this.elbRequests;
        if (this.elbRequests.length > 0) {
          this.showElbRequestTable = true;
          this.totalElbRequestPrice = 0;
          this.elbRequests.forEach(instance => {
            this.totalElbRequestPrice += parseFloat(
              instance.Calculated_Cost__c
            );
          });
          this.fireElbRequestPrice();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.elbRequests = undefined;
      });
  }
  notesModel() {
    this.addNote = true;
  }

  fireElbRequestPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalElbRequestPrice", this.totalElbRequestPrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}