/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ID_FIELD from "@salesforce/schema/Ocean_Request__c.Id";
import OCEAN_CRMT_STATUS_FIELD from "@salesforce/schema/Ocean_Request__c.CRMT_Request_Status__c";
import OCEAN_REVIEW_COMMENTS_FIELD from "@salesforce/schema/Ocean_Request__c.Approval_Comments__c";
import getAdminReviewStages from "@salesforce/apex/OceanController.getAdminReviewStages";
import getApprovalHistory from "@salesforce/apex/OceanController.getApprovalHistory";

export default class AdminReview extends LightningElement {
  @api currentUserAccess;
  @api currentOceanRequest;

  @track isConfirmAction;
  @track isApproveOrDenyAction;
  @track isBypassAction;
  @track isLoadComplete = false;
  @track progressBarStep;
  @track disableConfirmSubmit = true;
  @track showSpinner = false;
  @track showAdminActions = false;
  @track confirmDialogue = false;
  @track showApproveBtn;
  @track currentAdminReviewStage;
  @track isApproveFlow = false;
  @track isDenyFlow = false;
  @track approvalHistory;

  reviewComments;
  bypassNextStatus;

  PROGRESS_BAR_STEPS = [
    "COR/GTL Approval",
    "Intake Review",
    "ROM Review",
    "RFP Review",
    "ADO Attestation",
    "Review Complete"
  ];

  get requestBypassOptions() {
    return [
      { label: "Request ROM", value: "ROM Requested" },
      { label: "Request RFP", value: "RFP Requested" },
      { label: "Accept RFP", value: "RFP Accepted" },
      { label: "Request Attestation", value: "Attestation Requested" }
    ];
  }

  get acceptedFormats() {
    return [".pdf", ".png"];
  }

  connectedCallback() {
    this.showCurrentProgressBarStep();
    this.getCurrentStageData();
    this.getApprovalHistoryById();
  }

  getApprovalHistoryById() {
    getApprovalHistory({ Id: this.currentOceanRequest.id })
      .then(r => {
        if (r) this.approvalHistory = r;
        console.log(r);
      })
      .catch(e => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error querying approval history. Please try again",
            message: e.message,
            variant: "error"
          })
        );
      });
  }

  showCurrentProgressBarStep() {
    const reviewStage = this.currentOceanRequest.reviewStage;
    this.progressBarStep = this.PROGRESS_BAR_STEPS.indexOf(reviewStage);
    this.progressBarStep =
      this.progressBarStep === this.PROGRESS_BAR_STEPS.length
        ? this.progressBarStep - 1
        : this.progressBarStep;
    this.progressBarStep = this.progressBarStep.toString();
  }

  buildAdminReviewScreen() {
    //Determine if admin actions are needed
    this.showAdminActions =
      (this.currentAdminReviewStage.UserRoleAccess__c === "Review" &&
        this.currentUserAccess.access.Review__c) ||
      (this.currentAdminReviewStage.UserRoleAccess__c === "Approve" &&
        this.currentUserAccess.access.Approve__c);

    this.isApproveOrDenyAction =
      this.currentAdminReviewStage.Action__c === "Approve/Deny";

    this.isConfirmAction = this.currentAdminReviewStage.Action__c === "Confirm";
  }

  openDialogue(e) {
    this.isApproveFlow = e.target.value === "approve";
    this.isDenyFlow = !this.isApproveFlow;
    this.confirmDialogue = true;
  }

  confirmStatus() {
    this.isApproveFlow = true;
    this.updateStatus();
  }

  closeDialogue() {
    this.confirmDialogue = false;
    this.isApproveFlow = false;
    this.isDenyFlow = false;
    this.isBypassAction = false;
  }

  confirmStatusHandler(e) {
    this.disableConfirmSubmit = !e.target.checked;
  }

  getCurrentStageData() {
    this.showSpinner = true;
    getAdminReviewStages()
      .then(r => {
        const CRMTStatus = this.currentOceanRequest.CRMTStatus;
        this.adminReviewStages = r;
        this.currentAdminReviewStage = this.adminReviewStages.find(
          ({ Status__c }) => Status__c === CRMTStatus
        );
        this.buildAdminReviewScreen();
        this.isLoadComplete = true;
      })
      .catch(e => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error querying review stages. Please try again",
            message: e.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        this.showSpinner = false;
      });
  }

  handleRequestBypassChange(event) {
    const nextStatus = event.target.value;
    if (nextStatus) {
      this.bypassNextStatus = nextStatus;
    }
  }

  bypassStatus() {
    this.submitRequest(this.bypassNextStatus);
  }

  updateStatus() {
    if (this.isApproveFlow || this.isDenyFlow) {
      const nextStatus = this.isApproveFlow
        ? this.currentAdminReviewStage.Approval_Status__c
        : this.isDenyFlow
        ? this.currentAdminReviewStage.Denial_Status__c
        : "";
      this.submitRequest(nextStatus);
    }
  }

  handleActionFormSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    if (this.bypassNextStatus)
      fields[OCEAN_CRMT_STATUS_FIELD.fieldApiName] = this.bypassNextStatus;
    this.showSpinner = true;
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }

  handleActionFormSucess() {
    const statusChangeEvent = new CustomEvent("requeststatuschange");
    this.dispatchEvent(statusChangeEvent);
  }

  handleActionFormError() {
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Error on Request Status change",
        message: "Please try again",
        variant: "error"
      })
    );
    this.showSpinner = false;
  }

  reviewHistoryChangeHandler(event) {
    const reviewComments = event.target.value;
    if (reviewComments) this.reviewComments = reviewComments;
  }

  submitRequest(status) {
    this.closeDialogue();
    this.showSpinner = true;
    // Create the recordInput object
    const fields = {};
    fields[ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    fields[OCEAN_CRMT_STATUS_FIELD.fieldApiName] = status;
    if (this.reviewComments)
      fields[OCEAN_REVIEW_COMMENTS_FIELD.fieldApiName] = this.reviewComments;
    const recordInput = { fields: fields };
    updateRecord(recordInput)
      .then(() => {
        //Trigger request parent component reload
        const statusChangeEvent = new CustomEvent("requeststatuschange");
        this.dispatchEvent(statusChangeEvent);
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error submitting status change. Please try again",
            message: error.body.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        this.showSpinner = false;
      });
  }
}
