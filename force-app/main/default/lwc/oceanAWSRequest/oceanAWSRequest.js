/* eslint-disable no-console */
import { LightningElement, track } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
//import { ShowToastEvent } from "lightning/platformShowToastEvent";
// import ADO_NAME from "@salesforce/schema/Ocean_Request.ADO_Name";
// import ADO_NAME from "@salesforce/schema/Ocean_Request__c.ADOName__c";
// import PROJECT_NAME from "@salesforce/schema/Ocean_Request__c.ProjectName__c";
// import AWS_INSTANCES from "@salesforce/schema/Ocean_Request__c.AWSInstances__c";
// import PERIOD_OF_PERFORMANCE from "@salesforce/schema/Ocean_Request__c.PeriodOfPerformance__c";
// import MONTHS_IN_POP from "@salesforce/schema/Ocean_Request__c.MonthsInPoP__c";
// import AWS_ACCOUNT_NAME from "@salesforce/schema/Ocean_Request__c.AWSAccountName__c";

export default class OceanAWSRequest extends LightningElement {
  @track adoName;
  @track awsAccountName;
  @track monthsRemainingInPop;
  @track pop;
  @track projectName;
  @track projectNumber;
  oceanRequest;
  current = "ocean-request";
  @track isEc2Current = false;
  @track isOceanRequestShow = true;
  @track oceanRequestId = '12345';

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
      AWSInstances__c: this.instances? this.instances.toString().replace(/,/g, ";"): '',
      PeriodOfPerformance__c: this.pop,
      MonthsInPoP__c: this.monthsRemainingInPop,
      AWSAccountName__c: this.awsAccountName,
      Cloud_Service_Provider_Project_Number__c: this.projectNumber
    };
    console.log("Shan - Ocean Object entered is : " + JSON.stringify(fields));
    const recordInput = { apiName: "Ocean_Request__c", fields };
    createRecord(recordInput)
      .then(response => {
        this.oceanRequestId = response.id;
        console.log("Ocean Request has been created : ", this.oceanRequestId);
        // this.dispatchEvent(
        //   new ShowToastEvent({
        //     title: "Success",
        //     message: "OCEAN request has been created successfully!",
        //     variant: "success"
        //   })
        // );
        console.log('Ec2 is Current? 1 ' + this.isEc2Current);
        this.isOceanRequestShow = false;
        this.isEc2Current = true;
        console.log('Ec2 is Current? 2 ' + this.isEc2Current);
      })
      .catch(error => {
        console.error("Error in creating  record : ", error.body.message);
      });
  }

  handleEc2Instances() {
    console.log("handleNotify executed");
  }
}
