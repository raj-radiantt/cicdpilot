/* eslint-disable no-console */
import { LightningElement, track, wire } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { fireEvent } from "c/pubsub";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";

export default class Request extends NavigationMixin(LightningElement) {
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

  @wire(CurrentPageReference) pageRef;
  setRequestServices() {
    console.log(
      " ->> set request services preparing to fire: " +
        JSON.stringify(this.instances)
    );
    fireEvent(this.pageRef, "requestServices", this.instances);
    console.log(" ->> set request services fired ");
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
        this.isEc2Current = true;
        fireEvent(this.pageRef, "requestServices", this.instances);
      })
      .catch(error => {
        console.error("Error in creating  record : ", error);
      });
  }

  handleEc2Instances() {
    console.log("handleNotify executed");
  }
}
