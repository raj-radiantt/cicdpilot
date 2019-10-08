/* eslint-disable no-console */
import { LightningElement, track, wire, api } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";
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
  get ec2InstanceTypes() {
    return [
      { label: "Select", value: "" },
      { label: "t1.micro", value: "t1.micro" },
      { label: "t2.nano", value: "t2.nano" },
      { label: "t2.micro", value: "t2.micro" },
      { label: "t2.small", value: "t2.small" },
      { label: "t2.medium", value: "t2.medium" },
      { label: "t2.large", value: "t2.large" },
      { label: "t2.xlarge", value: "t2.xlarge" },
      { label: "t2.2xlarge", value: "t2.2xlarge" },
      { label: "m4.large", value: "m4.large" },
      { label: "m4.xlarge", value: "}, m4.xlarge" },
      { label: "m4.2xlarge", value: "m4.2xlarge" },
      { label: "m4.4xlarge", value: "m4.4xlarge" },
      { label: "m4.10xlarge", value: "m4.10xlarge" },
      { label: "m4.16xlarge", value: "m4.16xlarge" },
      { label: "m5.large", value: "m5.large" },
      { label: "m5.xlarge", value: "m5.xlarge" },
      { label: "m5.2xlarge", value: "m5.2xlarge" },
      { label: "m5.4xlarge", value: "m5.4xlarge" },
      { label: "m5.12xlarge", value: "m5.12xlarge" },
      { label: "m5.24xlarge", value: "m5.24xlarge" },
      { label: "m3.medium", value: "m3.medium" },
      { label: "m3.large", value: "m3.large" },
      { label: "m3.xlarge", value: "m3.xlarge" },
      { label: "m3.2xlarge", value: "m3.2xlarge" },
      { label: "c5.large", value: "c5.large" },
      { label: "c5.xlarge", value: "c5.xlarge" },
      { label: "c5.2xlarge", value: "c5.2xlarge" },
      { label: "c5.4xlarge", value: "c5.4xlarge" },
      { label: "c5.9xlarge", value: "c5.9xlarge" },
      { label: "c5.18xlarge", value: "c5.18xlarge" },
      { label: "c4.large", value: "c4.large" },
      { label: "c4.xlarge", value: "c4.xlarge" },
      { label: "c4.2xlarge", value: "c4.2xlarge" },
      { label: "c4.4xlarge", value: "c4.4xlarge" },
      { label: "c4.8xlarge", value: "c4.8xlarge" },
      { label: "c3.large", value: "c3.large" },
      { label: "c3.xlarge", value: "c3.xlarge" },
      { label: "c3.2xlarge", value: "c3.2xlarge" },
      { label: "c3.4xlarge", value: "c3.4xlarge" },
      { label: "c3.8xlarge", value: "c3.8xlarge" },
      { label: "p2.xlarge", value: "p2.xlarge" },
      { label: "p2.8xlarge", value: "p2.8xlarge" },
      { label: "p2.16xlarge", value: "p2.16xlarge" },
      { label: "p3.2xlarge", value: "p3.2xlarge" },
      { label: "p3.8xlarge", value: "p3.8xlarge" },
      { label: "p3.16xlarge", value: "p3.16xlarge" },
      { label: "g2.2xlarge", value: "g2.2xlarge" },
      { label: "g2.8xlarge", value: "g2.8xlarge" },
      { label: "g3.4xlarge", value: "g3.4xlarge" },
      { label: "g3.8xlarge", value: "g3.8xlarge" },
      { label: "g3.16xlarge", value: "g3.16xlarge" },
      { label: "r3.large", value: "r3.large" },
      { label: "r3.xlarge", value: "r3.xlarge" },
      { label: "r3.2xlarge", value: "r3.2xlarge" },
      { label: "r3.4xlarge", value: "r3.4xlarge" },
      { label: "r3.8xlarge", value: "r3.8xlarge" },
      { label: "r4.2xlarge", value: "r4.large" },
      { label: "r4.8xlarge", value: "r4.xlarge" },
      { label: "r4.16xlarge", value: "r4.2xlarge" },
      { label: "x1.32xlarge", value: "r4.4xlarge" },
      { label: "x1e.2xlarge", value: "r4.8xlarge" },
      { label: "x1e.4xlarge", value: "r4.16xlarge" },
      { label: "x1e.8xlarge", value: "x1.16xlarge" },
      { label: "x1e.16xlarge", value: "x1.32xlarge" },
      { label: "x1e.32xlarge", value: "x1e.xlarge" },
      { label: "i2.xlarge", value: "x1e.2xlarge" },
      { label: "i2.2xlarge", value: "x1e.4xlarge" },
      { label: "i2.4xlarge", value: "x1e.8xlarge" },
      { label: "i2.8xlarge", value: "x1e.16xlarge" },
      { label: "i3.large", value: "x1e.32xlarge" },
      { label: "i3.xlarge", value: "i2.xlarge" },
      { label: "i3.2xlarge", value: "i2.2xlarge" },
      { label: "i3.4xlarge", value: "i2.4xlarge" },
      { label: "i3.8xlarge", value: "i2.8xlarge" },
      { label: "i3.16xlarge", value: "i3.large" },
      { label: "hs1.8xlarge", value: "i3.xlarge" },
      { label: "d2.xlarge", value: "i3.2xlarge" },
      { label: "d2.2xlarge", value: "i3.4xlarge" },
      { label: "d2.4xlarge", value: "i3.8xlarge" },
      { label: "d2.8xlarge", value: "i3.16xlarge" },
      { label: "h1.2xlarge", value: "hs1.8xlarge" },
      { label: "h1.4xlarge", value: "d2.xlarge" },
      { label: "h1.8xlarge", value: "d2.2xlarge" },
      { label: "h1.16xlarge", value: "d2.4xlarge" },
      { label: "f1.2xlarge", value: "d2.8xlarge" },
      { label: "f1.16xlarge", value: "h1.2xlarge" },
      { label: "m1.small", value: "h1.4xlarge" },
      { label: "m1.medium", value: "h1.8xlarge" },
      { label: "m1.large", value: "h1.16xlarge" },
      { label: "m1.xlarge", value: "f1.2xlarge" },
      { label: "c1.medium", value: "f1.16xlarge" },
      { label: "c1.xlarge", value: "m1.small" },
      { label: "cc2.8xlarge", value: "m1.medium" },
      { label: "cg1.4xlarge", value: "m1.large" },
      { label: "m2.xlarge", value: "m1.xlarge" },
      { label: "m2.2xlarge", value: "c1.medium" },
      { label: "m2.4xlarge", value: "c1.xlarge" },
      { label: "cr1.8xlarge", value: "cr1.8xlarge" },
      { label: "cg1.4xlarge", value: "g1.4xlarge" },
      { label: "m2.xlarge", value: "m2.xlarge" },
      { label: "m2.2xlarge", value: "m2.2xlarge" },
      { label: "m2.4xlarge", value: "m2.4xlarge" },
      { label: "cr1.8xlarge", value: "cr1.8xlarge" }
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
      { label: 'Convertible Reserved', value: 'Convertible Reserved'},
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
        if (error) console.error("Error in creating EC2 compute record for request id: [" + this.oceanRequestId +"]: ", error);
      });
  }
  // in order to refresh your data, execute this function:
  refreshData() {
    return refreshApex(this.rows);
  }
}