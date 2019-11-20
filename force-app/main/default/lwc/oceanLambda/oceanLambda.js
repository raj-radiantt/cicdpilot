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
import getEc2ComputePrice from "@salesforce/apex/OceanAwsPricingData.getEc2ComputePrice";
import getLambdaRequests from "@salesforce/apex/OceanController.getLambdaRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Lambda__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Lambda__c.Ocean_Request_Id__c";
import NUMBER_OF_EXECUTIONS_PER_MONTH_FIELD from "@salesforce/schema/Ocean_Lambda__c.Number_of_Executions_per_Month__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Lambda__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Lambda__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Lambda__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Lambda__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Lambda__c.Application_Component__c";
import ALLOCATED_MEMORY_MB_FIELD from "@salesforce/schema/Ocean_Lambda__c.Allocated_Memory_MB__c";
import EXECUTION_TIME_FIELD from "@salesforce/schema/Ocean_Lambda__c.Estimated_Execution_Time_ms__c";
import NUMBER_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_Lambda__c.Number_of_Months_Requested__c";
import ESTIMATED_MONTHLY_COST_FIELD from "@salesforce/schema/Ocean_Lambda__c.Estimated_Monthly_Cost__c";
import TOTAL_ESTIMATED_COST_FIELD from "@salesforce/schema/Ocean_Lambda__c.Total_Estimated_Cost__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_Lambda__c.AWS_Account_Name__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  Application_Component_FIELD,
  EXECUTION_TIME_FIELD,
  NUMBER_OF_MONTHS_FIELD,
  NUMBER_OF_EXECUTIONS_PER_MONTH_FIELD,
  ALLOCATED_MEMORY_MB_FIELD,
  ESTIMATED_MONTHLY_COST_FIELD,
  TOTAL_ESTIMATED_COST_FIELD,
  ADO_Notes_FIELD
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
  { label: "Instance Id", fieldName: "Lambda_Request_Id__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Allocated Memory", fieldName: "Allocated_Memory_MB__c", type: "number", cellAttributes: { alignment: 'center' } },
  { label: "Number of Months Requested", fieldName: "Number_of_Months_Requested__c", type: "number", cellAttributes: { alignment: 'center' } },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanLambda extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showEc2Table = false;
  @track addNote = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2 = COLS2;
  @track totalLambdaPrice = 0.0;
  @track lambdaInstances = []
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

  handleLambdaComputeRowActions(event) {
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
    currentRow.Lambda_Request_Id__c = undefined;
    const fields = currentRow;
    this.setApplicationFields(fields);
    this.createLambdaInstance(fields);
  }
  // closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }
  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
  }
  handleLambdaSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveLambdaInstance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleLambdaComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Lambda instance has been removed",
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

  submitLambdaHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createLambdaInstance(fields);
  }

  createLambdaInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveLambdaInstance(fields);
  }
  saveLambdaInstance(fields) {
    const recordInput = { apiName: "Ocean_Lambda__c", fields };
    console.log(fields);
    if (this.currentRecordId) {
      delete recordInput.apiName;
      fields[ID_FIELD.fieldApiName] = this.currentRecordId;
      updateRecord(recordInput)
        .then(() => {
          this.updateTableData();
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success",
              message: "Success! Lambda instance has been updated!",
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
              "Error in creating Lambda record for request id: [" +
              this.oceanRequestId +
              "]: ",
              error
            );
        });
    }
  }

  updateTableData() {
    getLambdaRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.lambdaInstances = result;
        this.rows = [];
        this.rows = this.lambdaInstances;
        if (this.lambdaInstances.length > 0) {
          this.showLambdaTable = true;
        }
        //this.updateEc2Price();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.lambdaInstances = undefined;
      });

  }
  getPricingRequestData(instance) {
    var platforms = instance.Platform__c.split(",").map(s => s.trim());
    var [platform, preInstalledSW] = [platforms[0], platforms.length > 1 ? platforms[1] : ""];
    var [offeringClass, termType, leaseContractLength, purchaseOption] = ["", "", "", ""];
    var fundingTypes = instance.ADO_FUNDING_TYPE__c.split(",").map(s => s.trim());

    if (fundingTypes.length > 1) {
      [offeringClass, termType, leaseContractLength, purchaseOption] = [fundingTypes[0], fundingTypes[1], fundingTypes[2], fundingTypes[3]];
    }
    else {
      termType = fundingTypes[0];
    }

    return{
      pricingRequest: {
        platform: platform,
        preInstalledSW: preInstalledSW,
        tenancy: instance.Tenancy__c,
        region: instance.AWS_Region__c,
        instanceType: instance.EC2_Instance_Type__c,
        offeringClass: offeringClass,
        termType: termType,
        leaseContractLength: leaseContractLength,
        purchaseOption: purchaseOption
      }
    };
  }
  updateEc2Price() {
    this.totalEc2Price = 0.0;
    this.ec2Instances.forEach((instance) => {
      getEc2ComputePrice(this.getPricingRequestData(instance))
        .then(result => {
          var cost = 0;
          if (result) {
            result.forEach(r => {
                cost += (r.Unit__c === "Quantity") ? (parseFloat(r.PricePerUnit__c) * parseInt(instance.Instance_Quantity__c, 10)): 
                (parseFloat(r.PricePerUnit__c) * parseInt(instance.PerInstanceUptimePerMonth__c, 10) * parseInt(instance.Instance_Quantity__c, 10));
            });
            this.totalEc2Price = parseFloat(cost + parseFloat(this.totalEc2Price)).toFixed(2);
            this.fireLambdaPrice();
          }
        })
        .catch(error => {
          console.log(error);
          this.error = error;
        });
    });
  }
  fireLambdaPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalLambdaPrice", this.totalLambdaPrice);
  }
  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}