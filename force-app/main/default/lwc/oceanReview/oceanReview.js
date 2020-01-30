/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getResourceRequestSummary from "@salesforce/apex/OceanController.getResourceRequestSummary";
import OCEAN_STATUS_FIELD from "@salesforce/schema/Ocean_Request__c.Request_Status__c";
import OCEAN_CRMT_STATUS_FIELD from "@salesforce/schema/Ocean_Request__c.CRMT_Request_Status__c";
import ID_FIELD from "@salesforce/schema/Ocean_Request__c.Id";
import ESTMATED_TOTAL_COST_FIELD from "@salesforce/schema/Ocean_Request__c.Total_Estimated_Cost__c";
import COR_GTL_COMMENTS_FIELD from "@salesforce/schema/Ocean_Request__c.COR_GTL_Comments__c";

const resourceRequest = {
  awsResource: "",
  totalRequests: 0,
  devEstCost: 0,
  testEstCost: 0,
  implEstCost: 0,
  prodEstCost: 0,
  manEstCost: 0
};

export default class OceanReview extends LightningElement {
  @api currentOceanRequest;
  @api currentUserAccess;
  @api isAdoRequestor;
  @api isReadonlyUser;
  @track showSpinner;
  @track userAction;
  @track isDraft;
  @track isCORApproval = false;
  @track isAttestationRequested = false;
  @track disableSubmit = true;
  @track calculatedCosts = {
    implementation: {},
    production: {},
    lowerenv: {},
    env: {
      implementation: 0,
      production: 0,
      lowerenv: 0
    }
  };
  @track activeSectionMessage = "";
  @track productionItems = {};
  @track implementationItems = {};
  @track lowerEnvItems = {};
  @track tabRequests;
  @track confirmDialogue = false;
  @track totalCost = 0;
  @track environmentCost = 0;
  @track environment = "Production";
  @track requestCost = {};
  @track isApprove = false;
  @track isDeny = false;
  @track requestSummaryData = [];
  @track corGTLComments = "";
  @track requestSummaryColumns = [
    { label: "AWS Resource", fieldName: "awsResource" },
    {
      label: "Number of Requests",
      fieldName: "totalRequests",
      type: "number",
      cellAttributes: { alignment: "left" }
    },
    {
      label: "Dev Est. Cost",
      fieldName: "devEstCost",
      type: "currency",
      cellAttributes: { alignment: "left" }
    },
    {
      label: "Test Est. Cost",
      fieldName: "testEstCost",
      type: "currency",
      cellAttributes: { alignment: "left" }
    },
    {
      label: "Impl Est. Cost",
      fieldName: "implEstCost",
      type: "currency",
      cellAttributes: { alignment: "left" }
    },
    {
      label: "Prod Est. Cost",
      fieldName: "prodEstCost",
      type: "currency",
      cellAttributes: { alignment: "left" }
    },
    {
      label: "Management Est. Cost",
      fieldName: "manEstCost",
      type: "currency",
      cellAttributes: { alignment: "left" }
    }
  ];
  

  connectedCallback() {
    if (this.currentUserAccess.access) this.setCurrentRequestStatus();
    this.getRequestSummary();
  }

  getRequestSummary() {
    getResourceRequestSummary({ oceanRequestId: this.currentOceanRequest.id })
      .then(result => {
        if (result) {
          const corGTLComments = result["COR/GTL Comments"];
          this.corGTLComments = corGTLComments[0][COR_GTL_COMMENTS_FIELD.fieldApiName];
          console.log(this.corGTLComments);
          delete result["COR/GTL Comments"];
          this.buildRequestSummaryDataTable(result);
        }
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error querying request summary. Please try again",
            message: error,
            variant: "error"
          })
        );
      });
  }

  hendleCORCommentsChange(event){
    this.corGTLComments = event.detail.value;
  }

  buildRequestSummaryDataTable(rawRequestSummaryData) {
    const keys = Object.getOwnPropertyNames(rawRequestSummaryData);
    var endRequest = Object.create(resourceRequest);
    endRequest.awsResource = "Total";
    this.requestSummaryData = [];
    keys.forEach(k => {
      var request = Object.create(resourceRequest);
      let reqCount = 0;
      rawRequestSummaryData[k].forEach(r => {
        reqCount += parseFloat(r.requestCount);

        // eslint-disable-next-line default-case
        switch (r.environment) {
          case "Production":
            request.prodEstCost = parseFloat(r.envCost);
            endRequest.prodEstCost += request.prodEstCost;
            break;
          case "Implementation":
            request.implEstCost = parseFloat(r.envCost);
            endRequest.implEstCost += request.implEstCost;
            break;
          case "Test":
            request.testEstCost = parseFloat(r.envCost);
            endRequest.testEstCost += request.testEstCost;
            break;
          case "Development":
            request.devEstCost = parseFloat(r.envCost);
            endRequest.devEstCost += request.devEstCost;
            break;
          case "Management":
            request.manEstCost = parseFloat(r.envCost);
            endRequest.manEstCost += request.manEstCost;
            break;
        }
      });
      request.totalRequests = reqCount;
      request.awsResource = k;
      this.requestSummaryData.push(request);
      endRequest.totalRequests += reqCount;
    });
    this.requestSummaryData.push(endRequest);
    this.totalCost =
      endRequest.prodEstCost +
      endRequest.implEstCost +
      endRequest.testEstCost +
      endRequest.devEstCost +
      endRequest.manEstCost;
  }

  setCurrentRequestStatus() {
    this.isDraft =
      this.currentUserAccess.access.Create__c &&
      this.currentOceanRequest.requestStatus === "Draft";
    this.isCORApproval =
      this.currentUserAccess.access.Approve_Request_Submission__c &&
      this.currentOceanRequest.requestStatus === "COR/GTL Approval";

    this.isAttestationRequested =
      this.currentUserAccess.access.Create__c &&
      this.currentOceanRequest.CRMTStatus === "Attestation Requested";

    this.userAction = this.isDraft
      ? "COR/GTL Approval"
      : this.isCORApproval
      ? "CRMT Intake Review"
      : this.isAttestationRequested
      ? "CRMT final review"
      : "";
  }

  openDialogue(event) {
    if (event.target.value === "approve") this.triggerApprove();
    else if (event.target.value === "deny") this.triggerDeny();
    this.confirmDialogue = true;
  }

  triggerApprove() {
    this.isApprove = true;
    this.isDeny = false;
  }

  triggerDeny() {
    this.isDeny = true;
    this.isApprove = false;
  }

  closeDialogue() {
    this.confirmDialogue = false;
  }

  reviewSubmitHandler(event) {
    this.disableSubmit = !event.target.checked;
  }

  submitRequest() {
    this.confirmDialogue = false;
    this.showSpinner = true;
    // Create the recordInput object
    const fields = {};
    fields[ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    if (this.isDraft) {
      fields[OCEAN_STATUS_FIELD.fieldApiName] = fields[
        OCEAN_CRMT_STATUS_FIELD.fieldApiName
      ] = "COR/GTL Approval";
    } else if (this.isAttestationRequested) {
      fields[OCEAN_STATUS_FIELD.fieldApiName] = fields[
        OCEAN_CRMT_STATUS_FIELD.fieldApiName
      ] = "Request Complete";
    } else if (this.isCORApproval && !this.isDeny) {
      fields[OCEAN_CRMT_STATUS_FIELD.fieldApiName] = "CRMT Intake Review";
    } else if (this.isDeny) {
      fields[OCEAN_STATUS_FIELD.fieldApiName] = fields[
        OCEAN_CRMT_STATUS_FIELD.fieldApiName
      ] = "Draft";
    }
    fields[COR_GTL_COMMENTS_FIELD.fieldApiName] = this.corGTLComments;
    fields[ESTMATED_TOTAL_COST_FIELD.fieldApiName] = this.totalCost;
    this.updateRequestStatus({ fields: fields });
  }

  closeModal() {
    this.confirmDialogue = false;
  }

  updateRequestStatus(recordInput) {
    updateRecord(recordInput)
      .then(() => {
        if (this.isDraft) {
          this.isDraft = false;
        } else if (this.isCORApproval) {
          this.isCORApproval = false;
          this.canWithdraw = false;
        }
        //Trigger request parent component reload
        const statusChangeEvent = new CustomEvent("requeststatuschange",  {detail : false});
        this.dispatchEvent(statusChangeEvent);
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error submitting request. Please try again",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }

  scaleFloat(v) {
    v = parseFloat(v);
    return isNaN(v) ? 0 : v;
  }
}