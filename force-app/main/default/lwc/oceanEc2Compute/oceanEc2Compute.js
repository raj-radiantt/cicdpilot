/* eslint-disable no-console */
import { LightningElement, track, wire, api } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";
import getAwsEc2Types from "@salesforce/apex/OceanDataOptions.getAwsEc2Types";

const COLS = [
  { label: "ID", fieldName: "id", editable: false },
  {
    label: "Resource Status",
    fieldName: "Resource_Status__c",
    editable: true,
    type: "text"
  },
  { label: "Tier", fieldName: "Tier__c", editable: true, type: "text" },
  {
    label: "AWS Availability Zone",
    fieldName: "AWS_Availability_Zone__c",
    editable: true,
    type: "text"
  },
  {
    label: "AWS Region",
    fieldName: "AWS_Region__c",
    editable: true,
    type: "text"
  },
  {
    label: "Ec2 Instance",
    fieldName: "EC2_Instance_Type__c",
    editable: true,
    type: "text"
  },
  {
    label: "Platform",
    fieldName: "Platform__c",
    editable: true,
    type: "text"
  },
  {
    label: "Per Instance Uptime Per Day",
    fieldName: "PerInstanceUptimePerDay__c",
    editable: true,
    type: "number"
  },
  {
    label: "Per Instance Uptime Per Month",
    fieldName: "PerInstanceUptimePerMonth__c",
    editable: true,
    type: "number"
  },
  {
    label: "Funding Type",
    fieldName: "ADO_FUNDING_TYPE__c",
    editable: true,
    type: "text"
  },
  {
    label: "Total Uptime Per Month ",
    fieldName: "TotalUptimePerMonth__c",
    editable: true,
    type: "number"
  },
  {
    label: "Total Uptime Per Year",
    fieldName: "TotalUptimePerYear__c",
    type: "number"
  },
  {
    label: "Inatance Quantity",
    fieldName: "Instance_Quantity__c",
    type: "text"
  }
];

export default class OceanEc2Compute extends LightningElement {
  @api oceanRequestId;
  ec2Instance;
  _wiredResult;
  @track resourceStatus;
  @track tier;
  @track awsRegion;
  @track ec2InstanceType;
  @track awsAvailabilityZone;
  @track osType;
  @track instanceQuantity;
  @track perInstanceUptimePerDay;
  @track perInstanceUptimePerMonth;
  @track proposedFundingType;
  @track totalUptimePerMonth;
  @track totalUptimePerYear;
  @track ec2Current = true;
  @track showEc2Table = false;

  @track error;
  @track columns = COLS;
  @track ec2Instances = [];
  @track draftValues = [];
  @track rows;
  @wire(CurrentPageReference)
  currentPageReference;

  @wire(getAwsEc2Types)
  awsEc2InstanceTypes = [];
  ec2InstanceTypes = [];

  @wire(getAwsEc2Types)
  wiredResult(result) {
    if (result.data) {
      const conts = result.data;
      for (const key in conts) {
        if (Object.prototype.hasOwnProperty.call(conts, key)) {
          this.ec2InstanceTypes.push({ value: conts[key], label: key }); //Here we are creating the array to show on UI.
        }
      }
      console.log('Instances: ' + JSON.stringify(this.ec2InstanceTypes));
    }
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

  createEc2Instance() {
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
    const recordInput = { apiName: "OCEAN_Ec2Instance__c", fields };
    createRecord(recordInput)
      .then(response => {
        fields.id = response.id;
        this.rows = [];
        fields.oceanRequestId = this.oceanRequestId;
        this.ec2Instances.push(fields);
        this.rows = this.ec2Instances;
        if (this.ec2Instances.length > 0) {
          this.showEc2Table = true;
        }
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "EC2 instance has been added!",
            variant: "success"
          })
        );
        // Clear all draft values
        this.draftValues = [];
        // Display fresh data in the datatable
        return this.refreshData();
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
  // in order to refresh your data, execute this function:
  refreshData() {
    return refreshApex(this.rows);
  }
}
