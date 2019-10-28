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
import CSP_OPTION_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.CSP_Option_Year__c";
import Project_Name_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Project_Name__c";
import Application_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Application__c";
import WAVE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Wave_Submitted__c";
import Environment_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Region__c";
import AWS_Account_Name_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Account_Name__c";
import ADO_Notes_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Application_Component__c";
import AWS_Availability_Zone_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Availability_Zone__c";
import EC2_INSTANCE_TYPE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.EC2_Instance_Type__c";
import PLATFORM_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Platform__c";
import PerInstanceUptimePerDay_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.PerInstanceUptimePerDay__c";
import ADO_FUNDING_TYPE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.ADO_FUNDING_TYPE__c";
import TENANCY_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Tenancy__c";
import PerInstanceUptimePerMonth_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.PerInstanceUptimePerMonth__c";

const COLS1 = [
  Resource_Status_FIELD,
  Project_Name_FIELD,
  Application_FIELD,
  WAVE_FIELD,
  CSP_OPTION_FIELD,
  Environment_FIELD,
  AWS_Account_Name_FIELD,
  AWS_Region_FIELD,
  Application_Component_FIELD,
  EC2_INSTANCE_TYPE_FIELD,
  PLATFORM_FIELD,
  QUANTITY_FIELD,
  AWS_Availability_Zone_FIELD,
  PerInstanceUptimePerDay_FIELD,
  PerInstanceUptimePerMonth_FIELD,
  TENANCY_FIELD,
  ADO_FUNDING_TYPE_FIELD,
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
  { label: "Instance Id", fieldName: "InstanceID__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "Tenancy", fieldName: "Tenancy__c", type: "text" },
  { label: "Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Type", fieldName: "EC2_Instance_Type__c", type: "text" },
  { label: "Quantity", fieldName: "Instance_Quantity__c", type: "number", cellAttributes: { alignment: 'center' } },
  { label: "Platform", fieldName: "Platform__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanEc2Compute extends LightningElement {
  @api oceanRequestId;
  @track showEc2Table = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track ec2Instances = [];
  ec2InstanceTypes = [];
  @track totalEc2Price = 0.0;

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
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
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
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.oceanRequestId;
    this.createEc2Instance(fields);
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
    const recordInput = { apiName: "OCEAN_Ec2Instance__c", fields };
    if (this.currentRecordId) {
      delete recordInput.apiName;
      fields[ID_FIELD.fieldApiName] = this.currentRecordId;
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
              "Error in creating EC2 compute record for request id: [" +
              this.oceanRequestId +
              "]: ",
              error
            );
        });
    }
  }

  updateTableData() {
    getEc2Instances({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ec2Instances = result;
        this.rows = [];
        this.rows = this.ec2Instances;
        if (this.ec2Instances.length > 0) {
          this.showEc2Table = true;
        }
        this.updateEc2Price();
        this.showLoadingSpinner = false;
      })
      .catch(error => {
        this.error = error;
        this.ec2Instances = undefined;
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

    return {
      "platform": platform,
      "preInstalledSW": preInstalledSW,
      "tenancy": instance.Tenancy__c,
      "region": instance.AWS_Region__c,
      "instanceType": instance.EC2_Instance_Type__c,
      "offeringClass": offeringClass,
      "termType": termType,
      "leaseContractLength": leaseContractLength,
      "purchaseOption": purchaseOption
    };
  }
  updateEc2Price() {
    this.totalEc2Price = 0.0;
    this.ec2Instances.forEach((instance) => {
      getEc2ComputePrice(this.getPricingRequestData(instance))
        .then(result => {
          if (result) {
            this.totalEc2Price = parseFloat(
              Math.round(
                parseFloat(result.PricePerUnit__c) *
                parseInt(instance.PerInstanceUptimePerMonth__c, 10) *
                parseInt(instance.Instance_Quantity__c, 10)
              ) + parseFloat(this.totalEc2Price)
            ).toFixed(2);
            this.fireEc2Price();
          }
        })
        .catch(error => {
          console.log(error);
          this.error = error;
        });
    });
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