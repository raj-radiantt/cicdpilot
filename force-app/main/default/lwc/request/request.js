/* eslint-disable no-console */
import { LightningElement, track, api } from "lwc";
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ID_FIELD from '@salesforce/schema/Ocean_Request__c.Id';
//import CREATED_DATE_FIELD from '@salesforce/schema/Ocean_Request__c.CreatedDate';
import ADOName_FIELD from '@salesforce/schema/Ocean_Request__c.ADOName__c';
import Application_Acronym_FIELD from '@salesforce/schema/Ocean_Request__c.Application_Acronym__c';
import Application_Name_FIELD from '@salesforce/schema/Ocean_Request__c.Application_Name__c';
import Assumptions_FIELD from '@salesforce/schema/Ocean_Request__c.Assumptions__c';
import AWSAccountName_FIELD from '@salesforce/schema/Ocean_Request__c.AWSAccountName__c';
import Cloud_Service_Provider_Project_Number_FIELD from '@salesforce/schema/Ocean_Request__c.Cloud_Service_Provider_Project_Number__c';
import Current_Approved_Resources_FIELD from '@salesforce/schema/Ocean_Request__c.Current_Approved_Resources__c';
import MonthsInPoP_FIELD from '@salesforce/schema/Ocean_Request__c.MonthsInPoP__c';
import No_Additional_Funding_Requested_FIELD from '@salesforce/schema/Ocean_Request__c.No_Additional_Funding_Requested__c';
import Number_of_AWS_Accounts_FIELD from '@salesforce/schema/Ocean_Request__c.Number_of_AWS_Accounts__c';
import Option_Year_FIELD from '@salesforce/schema/Ocean_Request__c.Option_Year__c';
import Option_Year_End_Date_FIELD from '@salesforce/schema/Ocean_Request__c.Option_Year_End_Date__c';
import Option_Year_Start_Date_FIELD from '@salesforce/schema/Ocean_Request__c.Option_Year_Start_Date__c';
import PeriodOfPerformance_FIELD from '@salesforce/schema/Ocean_Request__c.PeriodOfPerformance__c';
import ProjectName_FIELD from '@salesforce/schema/Ocean_Request__c.ProjectName__c';
// import Request_Status_FIELD from '@salesforce/schema/Ocean_Request__c.Request_Status__c';
// import Submitted_Date_FIELD from '@salesforce/schema/Ocean_Request__c.Submitted_Date__c';
import Total_Estimated_Amount_FIELD from '@salesforce/schema/Ocean_Request__c.Total_Estimated_Amount__c';
import Wave_Submitted_FIELD from '@salesforce/schema/Ocean_Request__c.Wave_Submitted__c';
const FIELDS = [
  Option_Year_FIELD,
  Number_of_AWS_Accounts_FIELD,
  No_Additional_Funding_Requested_FIELD,
  MonthsInPoP_FIELD,
  Current_Approved_Resources_FIELD,
  Wave_Submitted_FIELD, 
  Total_Estimated_Amount_FIELD, 
  ProjectName_FIELD, 
  PeriodOfPerformance_FIELD, 
  Option_Year_Start_Date_FIELD, 
  Option_Year_End_Date_FIELD,
  Cloud_Service_Provider_Project_Number_FIELD,
  AWSAccountName_FIELD,
  Assumptions_FIELD,
  Application_Name_FIELD,
  Application_Acronym_FIELD,
  ADOName_FIELD
];

export default class Request extends LightningElement {
  @api oceanRequestId;
  @track oceanEc2ComputeInstances;
  @track disabled = false;
  @track showLoadingSpinner = false;
  @track error;
  @track adoName = 'GDIT';
  @track awsAccountName = 'aws-hhs-cms-mitg-ffm-gdit';
  @track monthsRemainingInPop = 12;
  @track pop = '10/02/2019 - 10/01/2020';
  @track projectName = 'Marketplace Enrollment';
  @track projectNumber ='SGEU-GDIT002';
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
  request = "request";
  review = "review";
  @api ec2Instances;
  @track fields = FIELDS;

  connectedCallback() {
    if(this.oceanRequestId) {
      this.editMode = true;
    }
  }
  handleSuccess(event) {
    const evt = new ShowToastEvent({
        title: "Ocean Request updated successfully",
        message: "Record ID: " + event.detail.id,
        variant: "success"
    });
    this.dispatchEvent(evt);
}
  
  adoNameChangeHandler(event) {
    this.disabled = false;
    this.adoName = event.target.value;
  }
  accountProjectNameChangeHandler(event) {
    this.disabled = false;
    this.projectName = event.target.value;
  }
  popChangeHandler(event) {
    this.disabled = false;
    this.pop = event.target.value;
  }
  awsAccountNameChangeHandler(event) {
    this.disabled = false;
    this.awsAccountName = event.target.value;
  }
  monthsRemainingChangeHandler(event) {
    this.disabled = false;
    this.monthsRemainingInPop = event.target.value;
  }
  handleInstanceChange(event) {
    this.disabled = false;
    this.instances = event.target.value;
  }
  awsProjectNumberChangeHandler(event) {
    this.disabled = false;
    this.projectNumber = event.target.value;
  }
  get selectedInstances() {
    return this.instances.length ? this.instances : "none";
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
        AWSInstances__c: this.instances
          ? this.instances.toString().replace(/,/g, ";")
          : "",
        PeriodOfPerformance__c: this.pop,
        MonthsInPoP__c: this.monthsRemainingInPop,
        AWSAccountName__c: this.awsAccountName,
        Cloud_Service_Provider_Project_Number__c: this.projectNumber
      };
      if(this.oceanRequestId) {
        fields.Id = this.oceanRequestId;
      }
      this.saveRequest(fields);
    } else {
      this.disabled = true;
    }
  }
  saveRequest(fields) {
    const recordInput = { apiName: "Ocean_Request__c", fields };
    if (this.oceanRequestId) {
      delete recordInput.apiName;
      fields[ID_FIELD.fieldApiName] = this.oceanRequestId;
      updateRecord(recordInput)
        .then(() => {
          this.refreshFlags();
          this.dispatchEvent(new ShowToastEvent({
            title: "Success",
            message: "Success! Please select one of the AWS Services tab to create records!",
            variant: "success"
          }));
        })
        .catch(error => {
          console.error("Error in updating  record : ", error);
        });
    }
    else {
      createRecord(recordInput)
        .then(response => {
          this.oceanRequestId = response.id;
          this.refreshFlags();
          this.dispatchEvent(new ShowToastEvent({
            title: "Success",
            message: "Request has been created!. Please select one of the AWS Services tab to create records!",
            variant: "success"
          }));
        })
        .catch(error => {
          console.error("Error in creating  record : ", error);
        });
    }
    this.disabled = false;
    this.showLoadingSpinner = false;
  }

  refreshFlags() {
    this.isOceanRequestShow = false;
    this.showTabs = true;
    if(this.instances) {
      this.showActiveTab(this.instances[0]);
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
    }
    else if (label === "EBS (Storage)") {
      this.showEbsStorageForm = true;
    }
    else if (label === "EFS (Storage)") {
      this.showEfsStorageForm = true;
    }
    else if (label === "S3 (Storage)") {
      this.showS3StorageForm = true;
    }
    else if (label === "Glacier (Storage&Data)") {
      this.showGlacierForm = true;
    }
    else if (label === "BS Data Transfer (Data)") {
      this.showBsDataTransferForm = true;
    }
    else if (label === "Workspaces (Desktop)") {
      this.showWorkspacesForm = true;
    }
    else if (label === "S3 (Data)") {
      this.showS3DataForm = true;
    }
    else if (label === "Redshift Data Nodes (DB)") {
      this.showRedshiftDataNodesForm = true;
    }
    else if (label === "DynamoDB (DB)") {
      this.showDynamoDbForm = true;
    }
    else if (label === "RDS (DB)") {
      this.showRDSDbForm = true;
    }
    else if (label === "Snowball (DataMigration)") {
      this.showSnowballForm = true;
    }
    else if (label === "Review") {
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
  get awsInstances() {
    return [
      { label: "EC2 Compute", value: "EC2 Compute" },
      { label: "EBS (Storage)", value: "EBS (Storage)" },
      { label: "EFS (Storage)", value: "EFS (Storage)" },
      { label: "S3 (Storage)", value: "S3 (Storage)" },
      { label: "Glacier (Storage&Data)", value: "Glacier (Storage&Data)" },
      { label: "BS Data Transfer (Data)", value: "BS Data Transfer (Data)" },
      { label: "Workspaces (Desktop)", value: "Workspaces (Desktop)" },
      { label: "S3 (Data)", value: "S3 (Data)" },
      { label: "Redshift Data Nodes (DB)", value: "Redshift Data Nodes (DB)" },
      { label: "DynamoDB (DB)", value: "BS Data Transfer (Data)" },
      { label: "RDS (DB)", value: "RDS (DB)" },
      { label: "Snowball (DataMigration)", value: "Snowball (DataMigration)" }
    ];
  }
}
