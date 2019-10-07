/* eslint-disable no-console */
import { LightningElement, track } from "lwc";
import { createRecord } from "lightning/uiRecordApi";

export default class Request extends LightningElement {
  @track adoName;
  @track awsAccountName;
  @track monthsRemainingInPop;
  @track pop;
  @track projectName;
  @track projectNumber;
  oceanRequest;
  @track isEc2Current = false;
  @track isOceanRequestShow = true;
  @track oceanRequestId;
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
  request = 'request';
  review = 'review';

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

  adoNameChangeHandler(event) {
    this.adoName = event.target.value;
  }
  accountProjectNameChangeHandler(event) {
    this.projectName = event.target.value;
  }
  popChangeHandler(event) {
    this.pop = event.target.value;
  }
  awsAccountNameChangeHandler(event) {
    this.awsAccountName = event.target.value;
  }
  monthsRemainingChangeHandler(event) {
    this.monthsRemainingInPop = event.target.value;
  }
  handleInstanceChange(event) {
    this.instances = event.target.value;
  }
  awsProjectNumberChangeHandler(event) {
    this.projectNumber = event.target.value;
  }
  get selectedInstances() {
    return this.instances.length ? this.instances : "none";
  }

  createOceanRequest() {
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
    const recordInput = { apiName: "Ocean_Request__c", fields };
    createRecord(recordInput)
      .then(response => {
        this.oceanRequestId = response.id;
        this.isOceanRequestShow = false;
        this.showTabs = true;
        this.showEc2ComputeForm = true;
      })
      .catch(error => {
        console.error("Error in creating  record : ", error);
      });
  }

  handleTab(event) {
    const label = event.target.label;
    this.resetAllForms();
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
    } else if (label === "Request") {
      this.isOceanRequestShow = true;
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
