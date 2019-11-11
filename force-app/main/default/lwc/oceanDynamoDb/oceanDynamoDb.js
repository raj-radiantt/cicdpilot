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
import getddbPrice from "@salesforce/apex/OceanAwsPricingData.getddbPrice";
import getddbRequests from "@salesforce/apex/OceanController.getddbRequests";
import ID_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Ocean_Request_Id__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.AWS_Region__c";
import AWS_ACCOUNT_NAME_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.AWS_Account_Name__c";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.ADO_Notes__c";
import APP_COMP_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Application_Component__c";
import DATA_RETRIEVAL_TYPE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Data_Retrieval_Type__c";
import DATA_RETRIEVAL_GB_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Data_Retrieval_GBMonth__c";
import EST_MONTH_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Estimated_Monthly_Cost__c";
import GETSELECT_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.GETSELECT_and_Other_Requests__c";
import LIFECYCLE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Number_of_Lifecycle_Transition_Requests__c";
import NUM_OF_MONTHS_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Number_of_Months_Requested__c";
import OBJ_MONITORED_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Objects_Monitored_per_Month__c";
import STORAGE_NOT_ACCESSED_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Storage_Not_Accessed_in_30_Days__c";
import PUTCOPY_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.PUTCOPYPOSTLIST_Requests__c";
import STORAGE_TYPE_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Storage_Type__c";
import TOTAL_EST_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Total_Estimated_Cost__c";
import TOTAL_STG_GB_MON_FIELD from "@salesforce/schema/Ocean_DynamoDB_Request__c.Total_Storage_GBMonth__c";

const COLS1 = [
  Resource_Status_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  DATA_RETRIEVAL_TYPE_FIELD,
  DATA_RETRIEVAL_GB_FIELD,
  GETSELECT_FIELD,
  LIFECYCLE_FIELD,
  NUM_OF_MONTHS_FIELD,
  OBJ_MONITORED_FIELD,
  STORAGE_NOT_ACCESSED_FIELD,
  PUTCOPY_FIELD,
  STORAGE_TYPE_FIELD,
  TOTAL_EST_FIELD,
  TOTAL_STG_GB_MON_FIELD,
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
  { label: "Request Id", fieldName: "Ocean_DynamoDB_Request_Id__c", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Cost", fieldName: "Calculated_Cost__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanDynamoDBRequest extends LightningElement {
  @api currentProjectDetails;
  @api oceanRequestId;
  @track showddbTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track ddbRequests = [];
  @track totalddbPrice = 0.0;

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

  handleddbComputeRowActions(event) {
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
    this.createddbInstance(fields);
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

  handleddbSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveddbInstance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleddbSuccess() {
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
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
  }

  submitddbHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    fields[AWS_ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createddbInstance(fields);
  }


  createddbInstance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveddbInstance(fields);
  }
  saveddbInstance(fields) {
    const recordInput = { apiName: "Ocean_DynamoDB_Request__c", fields };
    if (this.currentRecordId) {
      fields[ID_FIELD.fieldApiName] = this.currentRecordId;
      delete recordInput.apiName;
      updateRecord(recordInput)
        .then(() => {
          this.updateTableData();
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success",
              message: "Success! ddb instance has been updated!",
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
          this.updateTableData();
        })
        .catch(error => {
          if (error)
            console.error(
              "Error in creating ddb compute record for request id: [" +
              this.oceanRequestId +
              "]: ",
              error
            );
        });
    }
  }

  updateTableData() {
    getddbRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ddbRequests = result;
        this.rows = [];
        this.rows = this.ddbRequests;
        if (this.ddbRequests.length > 0) {
          this.showddbTable = true;
        }
        // this.updateddbPrice();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.ddbRequests = undefined;
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
        instanceType: instance.ddb_Instance_Type__c,
        offeringClass: offeringClass,
        termType: termType,
        leaseContractLength: leaseContractLength,
        purchaseOption: purchaseOption
      }
    };
  }
  updateddbPrice() {
    this.totalddbPrice = 0.0;
    this.ddbRequests.forEach((instance) => {
      getddbPrice(this.getPricingRequestData(instance))
        .then(result => {
          var cost = 0;
          if (result) {
            result.forEach(r => {
                cost += (r.Unit__c === "Quantity") ? (parseFloat(r.PricePerUnit__c) * parseInt(instance.Instance_Quantity__c, 10)): 
                (parseFloat(r.PricePerUnit__c) * parseInt(instance.PerInstanceUptimePerMonth__c, 10) * parseInt(instance.Instance_Quantity__c, 10));
            });
            this.totalddbPrice = parseFloat(cost + parseFloat(this.totalddbPrice)).toFixed(2);
            this.fireddbPrice();
          }
        })
        .catch(error => {
          console.log(error);
          this.error = error;
        });
    });
  }
  fireddbPrice() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalddbRequestPrice", this.totalddbPrice);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}