/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import getRdsRequests from "@salesforce/apex/OceanController.getRdsRequests";
import getVpcRequests from "@salesforce/apex/OceanController.getVpcRequests";
import getEc2Requests from "@salesforce/apex/OceanController.getEc2Instances";
import getEfsRequests from "@salesforce/apex/OceanController.getEfsRequests";
import getEbsRequests from "@salesforce/apex/OceanController.getEbsStorages";

export default class OceanReview extends LightningElement {
  @api oceanRequestId;
  @track rdsColumns = [
    { label: "Status", fieldName: "Resource_Status__c", type: "text" },
    { label: "Request Id", fieldName: "RDS_Request_Id__c", type: "text" },
    { label: "Environment", fieldName: "Environment__c", type: "text" },
    { label: "Region", fieldName: "AWS_Region__c", type: "text" },
    {
      label: "Availability Zone",
      fieldName: "Availability_Zone__c",
      type: "text"
    }
  ];
  @track ec2Requests;
  @track vpcRequests;
  @track ebsRequests;
  @track efsRequests;
  @track rdsRequests;
  @track activeSectionMessage = "";

  handleToggleSection(event) {
    this.activeSectionMessage =
      "Open section name:  " + event.detail.openSections;
  }
  handleSetActiveSectionC() {
    const accordion = this.template.querySelector(".example-accordion");
    accordion.activeSectionName = "RDS";
  }
  connectedCallback() {
    getRdsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.rdsRequests = result;
      })
      .catch(error => {
        this.error = error;
        this.rdsRequests = undefined;
      });
    getVpcRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.vpcRequests = result;
      })
      .catch(error => {
        this.error = error;
        this.vpcRequests = undefined;
      });

    getEfsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.efsRequests = result;
      })
      .catch(error => {
        this.error = error;
        this.efsRequests = undefined;
      });

    getEbsRequests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ebsRequests = result;
      })
      .catch(error => {
        this.error = error;
        this.ebsRequests = undefined;
      });

    getEc2Requests({ oceanRequestId: this.oceanRequestId })
      .then(result => {
        this.ec2Requests = result;
      })
      .catch(error => {
        this.error = error;
        this.ec2Requests = undefined;
      });
  }
}
