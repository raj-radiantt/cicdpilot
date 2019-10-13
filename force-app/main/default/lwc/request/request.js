/* eslint-disable no-console */
import { LightningElement, track, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
//import ID_FIELD from "@salesforce/schema/Ocean_Request__c.Id";
import ADOName_FIELD from "@salesforce/schema/Ocean_Request__c.ADOName__c";
import Application_Acronym_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Acronym__c";
import Application_Name_FIELD from "@salesforce/schema/Ocean_Request__c.Application_Name__c";
import Assumptions_FIELD from "@salesforce/schema/Ocean_Request__c.Assumptions__c";
import AWSAccountName_FIELD from "@salesforce/schema/Ocean_Request__c.AWSAccountName__c";
import Cloud_Service_Provider_Project_Number_FIELD from "@salesforce/schema/Ocean_Request__c.Cloud_Service_Provider_Project_Number__c";
import Current_Approved_Resources_FIELD from "@salesforce/schema/Ocean_Request__c.Current_Approved_Resources__c";
import MonthsInPoP_FIELD from "@salesforce/schema/Ocean_Request__c.MonthsInPoP__c";
import No_Additional_Funding_Requested_FIELD from "@salesforce/schema/Ocean_Request__c.No_Additional_Funding_Requested__c";
import Number_of_AWS_Accounts_FIELD from "@salesforce/schema/Ocean_Request__c.Number_of_AWS_Accounts__c";
import Option_Year_FIELD from "@salesforce/schema/Ocean_Request__c.Option_Year__c";
import Option_Year_End_Date_FIELD from "@salesforce/schema/Ocean_Request__c.Option_Year_End_Date__c";
import Option_Year_Start_Date_FIELD from "@salesforce/schema/Ocean_Request__c.Option_Year_Start_Date__c";
import PeriodOfPerformance_FIELD from "@salesforce/schema/Ocean_Request__c.PeriodOfPerformance__c";
import ProjectName_FIELD from "@salesforce/schema/Ocean_Request__c.ProjectName__c";
import AWSInstances_FIELD from "@salesforce/schema/Ocean_Request__c.AWSInstances__c";
import Wave_Submitted_FIELD from "@salesforce/schema/Ocean_Request__c.Wave_Submitted__c";
import getOceanRequestById from "@salesforce/apex/OceanAllRequests.getOceanRequestById";
const FIELDS = [
  ADOName_FIELD,
  Application_Name_FIELD,
  Application_Acronym_FIELD,
  AWSAccountName_FIELD,
  ProjectName_FIELD,
  Cloud_Service_Provider_Project_Number_FIELD,
  PeriodOfPerformance_FIELD,
  MonthsInPoP_FIELD,
  Option_Year_FIELD,
  Option_Year_Start_Date_FIELD,
  Option_Year_End_Date_FIELD,
  Wave_Submitted_FIELD,
  Number_of_AWS_Accounts_FIELD,
  AWSInstances_FIELD,
  Assumptions_FIELD,
  No_Additional_Funding_Requested_FIELD,
  Current_Approved_Resources_FIELD,
];

export default class Request extends LightningElement {
  @api oceanRequestId;
  @track awsInstances;
  @track disabled = false;
  @track showLoadingSpinner = false;
  @track error;
  @track isEc2Current = false;
  @track isOceanRequestShow = true;
  @track showTabs = false;
  @track showEc2ComputeForm = false;
  @track showEbsStorageForm = false;
  @track showEfsStorageForm = false;
  @track showS3StorageForm = false;
  @track showGlacierForm = false;
  @track showBsDataTransferForm = false;
  @track showWorkspacesForm = false;
  @track showS3DataForm = false;
  @track showRedshiftDataNodesForm = false;
  @track showDynamoDbForm = false;
  @track showRDSDbForm = false;
  @track showSnowballForm = false;
  @track showReviewPage = false;
  @track editMode = false;
  @track fields = FIELDS;

  // state management - start

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    registerListener("totalEc2ComputePrice", this.handleEc2PriceChange, this);
    registerListener("showDraftRequests", this.handleDraftRequests, this);
    if (this.oceanRequestId) {
      this.editMode = true;
      this.oceanRequestId1 = this.oceanRequestId;
    }
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handleEc2PriceChange(inpVal) {
    this.totalEc2ComputePrice = inpVal;
    this.totalRequestCost = parseFloat(this.totalEc2ComputePrice).toFixed(2);
  }

  // state management - end

  handleSuccess(event) {
    const evt = new ShowToastEvent({
      title: "Ocean Request updated successfully",
      message: "Record ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
    this.oceanRequestId = event.detail.id;
    this.awsInstances = event.detail.fields.AWSInstances__c.value.split(";");
    this.showTabs = true;
  }
  getOceanRequest() {
    getOceanRequestById({ id: this.oceanRequestId })
      .then(result => {
        if (result.AWSInstances__c) {
          this.awsInstances = result.AWSInstances__c.split(";");
          this.showTabs = true;
        }
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }

  save() {
    this.disabled = true;
    let allValid = [
      ...this.template.querySelectorAll("lightning-input")
    ].reduce((validSoFar, inputFields) => {
      inputFields.reportValidity();
      return validSoFar && inputFields.checkValidity();
    }, true);
    allValid = [
      ...this.template.querySelectorAll("lightning-dual-listbox")
    ].reduce((validSoFar, inputFields) => {
      inputFields.reportValidity();
      return validSoFar && inputFields.checkValidity();
    }, true);
    if (allValid) {
      this.showLoadingSpinner = true;
      this.disabled = false;
      const fields = {
        ADOName__c: this.adoName,
        ProjectName__c: this.projectName,
        AWSInstances__c: this.awsInstances
          ? this.awsInstances.toString().replace(/,/g, ";")
          : "",
        PeriodOfPerformance__c: this.pop,
        MonthsInPoP__c: this.monthsRemainingInPop,
        AWSAccountName__c: this.awsAccountName,
        Cloud_Service_Provider_Project_Number__c: this.projectNumber
      };
      if (this.oceanRequestId) {
        fields.Id = this.oceanRequestId;
      }
      this.saveRequest(fields);
    } else {
      this.disabled = true;
    }
  }
  refreshFlags() {
    this.isOceanRequestShow = false;
    this.showTabs = true;
    if (this.awsInstances) {
      this.showActiveTab(this.awsInstances[0]);
    }
  }
  showRequest() {
    this.resetAllForms();
    this.isOceanRequestShow = true;
  }
  handleTab(event) {
    this.resetAllForms();
    const label = event.target.label;
    this.showActiveTab(label);
  }
  showActiveTab(label) {
    this.isOceanRequestShow = false;
    if (label === "EC2 Compute") {
      this.showEc2ComputeForm = true;
    } else if (label === "EBS (Storage)") {
      this.showEbsStorageForm = true;
    } else if (label === "EFS (Storage)") {
      this.showEfsStorageForm = true;
    } else if (label === "S3 (Storage)") {
      this.showS3StorageForm = true;
    } else if (label === "Glacier (Storage&Data)") {
      this.showGlacierForm = true;
    } else if (label === "BS Data Transfer (Data)") {
      this.showBsDataTransferForm = true;
    } else if (label === "Workspaces (Desktop)") {
      this.showWorkspacesForm = true;
    } else if (label === "S3 (Data)") {
      this.showS3DataForm = true;
    } else if (label === "Redshift Data Nodes (DB)") {
      this.showRedshiftDataNodesForm = true;
    } else if (label === "DynamoDB (DB)") {
      this.showDynamoDbForm = true;
    } else if (label === "RDS (DB)") {
      this.showRDSDbForm = true;
    } else if (label === "Snowball (DataMigration)") {
      this.showSnowballForm = true;
    } else if (label === "Review") {
      this.showReviewPage = true;
    }
  }
  resetAllForms() {
    this.isOceanRequestShow = false;
    this.showReviewPage = false;
    this.showEc2ComputeForm = false;
    this.showEbsStorageForm = false;
    this.showEfsStorageForm = false;
    this.showS3StorageForm = false;
    this.showGlacierForm = false;
    this.showBsDataTransferForm = false;
    this.showWorkspacesForm = false;
    this.showS3DataForm = false;
    this.showRedshiftDataNodesForm = false;
    this.showDynamoDbForm = false;
    this.showRDSDbForm = false;
    this.showSnowballForm = false;
  }
}
