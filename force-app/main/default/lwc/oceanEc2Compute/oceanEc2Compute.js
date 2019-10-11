/* eslint-disable no-console */
import { LightningElement, track, wire, api } from "lwc";
import { createRecord, updateRecord, deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";
import getAwsEc2Types from "@salesforce/apex/OceanDataOptions.getAwsEc2Types";
import getEc2ComputePrice from "@salesforce/apex/OceanAwsPricingData.getEc2ComputePrice";
import { fireEvent } from "c/pubsub";
import getEc2Instances from "@salesforce/apex/OceanEc2ComputeController.getEc2Instances";
import ID_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Id";

// row actions
const actions = [
  { label: "Record Details", name: "record_details" },
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];
const COLS = [
  { label: "Resource Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Tier", fieldName: "Tier__c", type: "text" },
  { label: "AWS Availability Zone", fieldName: "AWS_Availability_Zone__c", type: "text"},
  { label: "AWS Region", fieldName: "AWS_Region__c", type: "text" },
  { label: "Ec2 Instance", fieldName: "EC2_Instance_Type__c", type: "text" },
  { label: "Instance Quantity", fieldName: "Instance_Quantity__c", type: "number" },
  { label: "Platform", fieldName: "Platform__c", type: "text" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class OceanEc2Compute extends LightningElement {
  @api oceanRequestId;

  @track resourceStatus = "New";
  @track tier = "Production";
  @track awsRegion = "US-East/US-Standard (Virginia)";
  @track ec2InstanceType = "m4.large";
  @track awsAvailabilityZone = "EastVA_AZLookup";
  @track osType = "RHEL";
  @track instanceQuantity = 10;
  @track perInstanceUptimePerDay = 704;
  @track perInstanceUptimePerMonth = 5000;
  @track proposedFundingType = "On-Demand";
  @track totalUptimePerMonth = 5000;
  @track totalUptimePerYear = 60000;
  @track ec2Current = true;
  @track showEc2Table = false;

  @track error;
  @track columns = COLS;
  @track ec2Instances = [];
  @track draftValues = [];
  @track rows;
  @wire(CurrentPageReference)
  currentPageReference;

  awsEc2InstanceTypes = [];
  ec2InstanceTypes = [];
  @track totalEc2Price = 0;

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
  handleRowActions(event) {
    let actionName = event.detail.action.name;
    let row = event.detail.row;
    this.currentRecordId = row.Id;
    // eslint-disable-next-line default-case
    switch (actionName) {
      case "record_details":
        this.viewCurrentRecord(row);
        break;
      case "edit":
        this.editCurrentRecord();
        break;
      case "delete":
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

  // closing modal box
  closeModal() {
    this.bShowModal = false;
  }

  editCurrentRecord() {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;
    // assign record id to the record edit form
  }

  // handleing record edit form submit
  handleSubmit(event) {
    this.showLoadingSpinner = true;
    // prevending default type sumbit of record edit form
    event.preventDefault();
    this.saveEc2Instance(event.detail.fields);
    // closing modal
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
    .then(() => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record Is  Deleted',
                variant: 'success',
            }),
        );
        this.updateTableData();
    })
    .catch(error => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error While Deleting record',
                message: error.message,
                variant: 'error',
            }),
        );
    });
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

  createEc2Instance() {
    this.showLoadingSpinner = true;
    const fields = {
      Platform__c: this.osType,
      Resource_Status__c: this.resourceStatus,
      Tier__c: this.tier,
      AWS_Availability_Zone__c: this.awsAvailabilityZone,
      AWS_Region__c: this.awsRegion,
      EC2_Instance_Type__c: this.ec2InstanceType,
      PerInstanceUptimePerDay__c: this.perInstanceUptimePerDay,
      PerInstanceUptimePerMonth__c: this.perInstanceUptimePerMonth,
      ADO_FUNDING_TYPE__c: this.proposedFundingType,
      TotalUptimePerMonth__c: this.totalUptimePerMonth,
      TotalUptimePerYear__c: this.totalUptimePerYear,
      Instance_Quantity__c: this.instanceQuantity,
      Ocean_Request_Id__c: this.oceanRequestId
    };
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
          //this.refreshFields();
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
          //return this.refreshFields(fields);
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
        // Clear all draft values
        this.draftValues = [];
        // Display fresh data in the datatable
        this.getEc2Price();
        return this.refreshApex(this.ec2Instances);
      })
      .catch(error => {
        this.error = error;
        this.contacts = undefined;
      });
    this.showLoadingSpinner = false;
  }
  refreshFields1(fields) {
    this.ec2Instances.push(fields);
    this.getEc2Price();
    // Clear all draft values
    this.draftValues = [];
    // Display fresh data in the datatable
    // this.refreshData();
    if (this.ec2Instances.length > 0) {
      this.showEc2Table = true;
    }
    return this.refreshApex(this.ec2Instances);
  }

  refreshFields(fields) {
    this.rows = [];
    this.ec2Instances.push(fields);
    this.rows = this.ec2Instances;
    if (this.ec2Instances.length > 0) {
      this.showEc2Table = true;
    }
    // Clear all draft values
    this.draftValues = [];
    // Display fresh data in the datatable
    this.getEc2Price();
    return this.refreshApex(this.ec2Instances);
  }
  getEc2Price() {
    //getEc2ComputePrice({platform: this.platform, pricingModel: this.proposedFundingType, region: this.region, paymentOption: this.paymentOption, reservationTerm: this.reservationTerm })
    getEc2ComputePrice({
      platform: "RHEL",
      pricingModel: "Standard Reserved",
      region: "us-east-1",
      paymentOption: "No Upfront",
      reservationTerm: 1,
      instanceType: "a1.xlarge"
    })
      .then(result => {
        if (result) {
          this.totalEc2Price = parseFloat(
            Math.round(
              parseFloat(result.OnDemand_hourly_cost__c) *
                parseInt(this.totalUptimePerYear, 10) *
                parseInt(this.instanceQuantity, 10)
            ) + parseFloat(this.totalEc2Price)
          ).toFixed(2);
          this.fireEc2Price();
        }
      })
      .catch(error => {
        console.log("Ec2 Price error: " + error);
        this.error = error;
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
  get resourceStatuses() {
    return [
      { label: "Select", value: "" },
      { label: "New", value: "New" },
      { label: "Continuation", value: "Continuation" },
      { label: "Discontinuation", value: "Discontinuation" }
    ];
  }
  get tiers() {
    return [
      { label: "Select", value: "" },
      { label: "Production", value: "Production" },
      { label: "Staging", value: "Staging" },
      { label: "Development", value: "New" },
      { label: "QA", value: "QA" },
      { label: "UAT", value: "UAT" },
      { label: "Impl", value: "Impl" }
    ];
  }
  get awsRegions() {
    return [
      { label: "Select", value: "" },
      {
        label: "US-East/US-Standard (Virginia)",
        value: "US-East/US-Standard (Virginia)"
      },
      { label: "US-West-2 (Oregon)", value: "US-West-2 (Oregon)" }
    ];
  }
  get awsAvailabilityZones() {
    return [
      { label: "Select", value: "" },
      { label: "EastVA_AZLookup", value: "EastVA_AZLookup" },
      { label: "WestOR_AZlookup", value: "WestOR_AZlookup" },
      { label: "us-east-1x", value: "Neus-east-1xw" },
      { label: "us-east-1y", value: "us-east-1y" },
      { label: "us-east-1z", value: "us-east-1z" },
      { label: "us-east-1y", value: "us-east-1y" },
      { label: "us-west-1x", value: "us-west-1x" },
      { label: "us-west-1y", value: "us-west-1y" },
      { label: "us-west-1z", value: "us-west-1z" }
    ];
  }
  get osTypes() {
    return [
      { label: "Select", value: "" },
      { label: "Linux", value: "Linux" },
      { label: "RHEL", value: "RHEL" },
      { label: "Windows", value: "Windows" }
    ];
  }
  get fundingTypes() {
    return [
      { label: "Select", value: "" },
      { label: "On-Demand", value: "On-Demand" },
      { label: "Convertible Reserved", value: "Convertible Reserved" },
      { label: "1 Yr No Upfront Reserved", value: "1 Yr No Upfront Reserved" },
      {
        label: "1 Yr Partial Upfront Reserved",
        value: "1 Yr Partial Upfront Reserved"
      },
      {
        label: "1 Yr All Upfront Reserved",
        value: "1 Yr All Upfront Reserved"
      },
      {
        label: "1 Yr No Upfront Convertible",
        value: "1 Yr No Upfront Convertible"
      },
      {
        label: "1 Yr Partial Upfront Convertible",
        value: "1 Yr Partial Upfront Convertible"
      },
      {
        label: "1 Yr All Upfront Convertible",
        value: "1 Yr All Upfront Convertible"
      }
    ];
  }

  resourceStatusChangeHandler(event) {
    this.resourceStatus = event.target.value;
  }
  awsRegionChangeHandler(event) {
    this.awsRegion = event.target.value;
  }
  awsAvailabilityZoneChangeHandler(event) {
    this.awsAvailabilityZone = event.target.value;
  }
  ec2InstanceTypeChangeHandler(event) {
    this.ec2InstanceType = event.target.value;
  }
  osTypeChangeHandler(event) {
    this.osType = event.target.value;
  }
  tierChangeHandler(event) {
    this.tier = event.target.value;
  }
  instanceQuantityChangeHandler(event) {
    this.instanceQuantity = event.target.value;
  }
  perInstanceUptimePerDayChangeHandler(event) {
    this.perInstanceUptimePerDay = event.target.value;
  }
  perInstanceUptimePerMonthChangeHandler(event) {
    this.perInstanceUptimePerMonth = event.target.value;
  }
  proposedFundingTypeChangeHandler(event) {
    this.proposedFundingType = event.target.value;
  }
  totalUptimePerMonthChangeHandler(event) {
    this.totalUptimePerMonth = event.target.value;
  }
  totalUptimePerYearChangeHandler(event) {
    this.totalUptimePerYear = event.target.value;
  }
}
