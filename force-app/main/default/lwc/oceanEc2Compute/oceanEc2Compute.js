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
import getAwsEc2Types from "@salesforce/apex/OceanDataOptions.getAwsEc2Types";
import getEc2ComputePrice from "@salesforce/apex/OceanAwsPricingData.getEc2ComputePrice";
import getEc2Instances from "@salesforce/apex/OceanController.getEc2Instances";
import ID_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Id";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Ocean_Request_Id__c";
import QUANTITY_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Instance_Quantity__c";
import Resource_Status_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Application_Component__c";
import AWS_Availability_Zone_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Availability_Zone__c";
import EC2_INSTANCE_TYPE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.EC2_Instance_Type__c";
import PLATFORM_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Platform__c";
import PerInstanceUptimePerDay_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.PerInstanceUptimePerDay__c";
import AWS_ACCOUNT_FIELD from '@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Account_Name__c';
import CALCULATED_COST_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Calculated_Cost__c";
import ADO_FUNDING_TYPE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.ADO_FUNDING_TYPE__c";
import TENANCY_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Tenancy__c";
import OCEAN_LOGO from "@salesforce/resourceUrl/oceanlogo";
import PerInstanceUptimePerMonth_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.PerInstanceUptimePerMonth__c";
import NUMBER_OF_MONTHS_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Per_Instance_Running_Months_in_Remaining__c";

const COLS1 = [
  Resource_Status_FIELD,
  AWS_ACCOUNT_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  Application_Component_FIELD,
  EC2_INSTANCE_TYPE_FIELD,
  PLATFORM_FIELD,
  QUANTITY_FIELD,
  AWS_Availability_Zone_FIELD,
  PerInstanceUptimePerDay_FIELD,
  PerInstanceUptimePerMonth_FIELD,
  NUMBER_OF_MONTHS_FIELD,
  TENANCY_FIELD,
  ADO_FUNDING_TYPE_FIELD,
  ADO_Notes_FIELD,
  
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
  { label: "Instance Id", fieldName: "InstanceID__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Tenancy", fieldName: "Tenancy__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Type", fieldName: "EC2_Instance_Type__c", type: "text" },
  {
    label: "Quantity",
    fieldName: "Instance_Quantity__c",
    type: "number",
    cellAttributes: { alignment: "center" }
  },
  { label: "Platform", fieldName: "Platform__c", type: "text" },
  {
    label: "Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "center" }
  },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanEc2Compute extends LightningElement {
  @api oceanRequestId;
  @api oceanRequest;
  @track showEc2Table = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track ec2Instances = [];
  ec2InstanceTypes = [];
  @track totalEc2Price = 0.0;
  @api currentProjectDetails;
  oceanLogoUrl = OCEAN_LOGO;

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
  handleEc2ComputeRowActions(event) {
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
    this.setApplicationFields(fields);
    this.createEc2Instance(fields);
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
  handleEc2ComputeSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveEc2Instance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleEc2ComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Ec2 instance has been removed",
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

  submitEc2ComputeHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    this.setApplicationFields(fields);
    this.createEc2Instance(fields);
  }

  setApplicationFields(fields) {
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
  }

  @wire(getAwsEc2Types)
  wiredResult(result) {
    if (result.data) {
      const conts = result.data;
      for (const key in conts) {
        if (Object.prototype.hasOwnProperty.call(conts, key)) {
          this.ec2InstanceTypes.push({ value: conts[key], label: key }); //Here we are creating the array to show on UI.
        }
      }
    }
  }
  createEc2Instance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    this.currentRecordId = null;
    this.saveEc2Instance(fields);
  }
  saveEc2Instance(fields) {
    /*var cost = 0;
    getEc2ComputePrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) {
          result.forEach(r => {
            cost +=
              r.Unit__c === "Quantity"
                ? parseFloat(r.PricePerUnit__c) *
                  parseInt(fields.Instance_Quantity__c, 10)
                : parseFloat(r.PricePerUnit__c) *
                  parseInt(fields.PerInstanceUptimePerMonth__c, 10) *
                  parseInt(fields.Instance_Quantity__c, 10);
          });
        }
      })
    .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "EC2 Pricing error",
            message: error.message,
            variant: "error"
          })
        );
    });
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "OCEAN_Ec2Instance__c", fields };
        if (this.currentRecordId) {
          delete recordInput.apiName;
          fields[ID_FIELD.fieldApiName] = this.currentRecordId;
          this.updateEC2Record(recordInput);
        } else {

          console.log('Step 4' + JSON.stringify(fields));
          this.createEC2Record(recordInput, fields);
        }
      });*/
      const recordInput = { apiName: "OCEAN_Ec2Instance__c", fields };
        if (this.currentRecordId) {
          delete recordInput.apiName;
          fields[ID_FIELD.fieldApiName] = this.currentRecordId;
          this.updateEC2Record(recordInput);
        } else {
          this.createEC2Record(recordInput, fields);
        }
  }

  updateEC2Record(recordInput) {
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! EC2 instance has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }

  createEC2Record(recordInput, fields){
    createRecord(recordInput)
    .then(response => {
      fields.Id = response.id;
      fields.oceanRequestId = this.oceanRequestId;
      this.updateTableData();
    })
    .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error in creating EC2 compute record for request id: [" + this.oceanRequestId + "]",
            message: error.message,
            variant: "error"
          })
        );
    });
  }

  updateTableData() {
    getEc2Instances({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        console.log(result);
        this.ec2Instances = result;
        this.rows = [];
        this.rows = this.ec2Instances;
        if (this.ec2Instances.length > 0) {
          this.showEc2Table = true;
          this.totalEc2Price = 0;
          this.ec2Instances.forEach(instance => {
            this.totalEc2Price += parseFloat(instance.Calculated_Cost__c);
          }); 
          this.fireEc2Price();
        }
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.ec2Instances = undefined;
        this.showLoadingSpinner = false;
      });
  }
  getPricingRequestData(instance) {
    var platforms = instance.Platform__c.split(",").map(s => s.trim());
    var [platform, preInstalledSW] = [
      platforms[0],
      platforms.length > 1 ? platforms[1] : ""
    ];
    var [offeringClass, termType, leaseContractLength, purchaseOption] = ["","", "",""];
    var fundingTypes = instance.ADO_FUNDING_TYPE__c.split(",").map(s =>
      s.trim()
    );

    if (fundingTypes.length > 1) {
      [offeringClass, termType, leaseContractLength, purchaseOption] = [fundingTypes[0], fundingTypes[1], fundingTypes[2], fundingTypes[3]];
    } else {
      termType = fundingTypes[0];
    }

    return {
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


  fireEc2Price() {
    // firing Event
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "LightningApp";
    }
    fireEvent(this.pageRef, "totalEc2ComputePrice", this.totalEc2Price);
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}