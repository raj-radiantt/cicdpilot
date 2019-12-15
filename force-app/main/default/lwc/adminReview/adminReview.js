/* eslint-disable no-console */
import { LightningElement, api, track, wire } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
//import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ID_FIELD from "@salesforce/schema/Ocean_Request__c.Id";
import OCEAN_STATUS_FIELD from "@salesforce/schema/Ocean_Request__c.Request_Status__c";
// import getRequestStatuses from "@salesforce/apex/OceanController.getCRMTRequestStatus";
import getAdminReviewStages from "@salesforce/apex/OceanController.getAdminReviewStages";
//import ADMIN_REVIEW_STAGES_OBJECT from "@salesforce/schema/Admin_Review_Stages__c";

export default class AdminReview extends LightningElement {
  @api currentUserAccess;
  @api currentOceanRequest;
  @track confirmDialogue = false;
  @track requestStatus;
  @track selectedStatus;
  @track progressBarStep;
  @track requestStatus = "romRequested";
  @track isButtonDisabled;
  @track showApproveBtn;
  @track showSpinner;
  @track showAdminActions = false;

  PROGRESS_BAR_STEPS = [
    "COR/GTL Approval",
    "Intake Review",
    "ROM Review",
    "RFP Review",
    "ADO Attestation",
    "Review Complete"
  ];

  BYPASS_STAGE_BUTTONS = {
    "request-rom": "ROM Requested",
    "request-rfp": "RFP Requested",
    "accept-rfp": "RFP Accepted",
    "request-attestation": "Attestation Requested"
  };

  @wire(getAdminReviewStages)
  wiredResult(result) {
    if (result.data) {
      console.log(result.data);
    }
  }

  // @wire(getRequestStatuses)
  // wiredResult(result) {
  //   if (result.data) {
  //     this.requestStatuses = result.data;
  //   }
  // }

  // @wire(getObjectInfo, { objectApiName: ADMIN_REVIEW_STAGES_OBJECT })
  //   statusresult(data) {
  //       if(data) {
  //         console.log(data);
  //       }
  //   }



  statuses = [
    // { id: 1, label: "Draft", value: "Draft" },
    // { id: 2, label: "COR/GTL Approval", value: "COR/GTL Approval" },
    { id: 3, label: "Submitted to CRMT", value: "Submitted to CRMT" },
    { id: 4, label: "CRMT Intake Review", value: "CRMT Intake Review" },
    {
      id: 5,
      label: "CRMT Intake Review Completed",
      value: "CRMT Intake Review Completed",
      selected: true
    },
    { id: 6, label: "ROM Requested", value: "ROM Requested" },
    { id: 7, label: "ROM Received", value: "ROM Received" },
    { id: 8, label: "ROM Approved", value: "ROM Approved" },
    { id: 9, label: "RFP Requested", value: "RFP Requested" },
    { id: 10, label: "RFP Received", value: "RFP Received" },
    { id: 11, label: "RFP Approved", value: "RFP Approved" },
    { id: 12, label: "Attestation Requested", value: "Attestation Requested" },
    { id: 13, label: "Approved", value: "Approved" }
  ];

  get requestOptions() {
    return this.statuses;
  }

  connectedCallback() {
    this.showCurrentProgressBarStep();
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

  renderedCallback() {}

  get statusOptions() {
    return this.statuses;
  }

  onBypassRequestStages(event) {
    if (event.target.value)
      console.log(this.BYPASS_STAGE_BUTTONS[event.target.value]);
  }

  confirmChangeStatus() {
    this.confirmDialogue = false;
    this.updateStatus();
  }
  corGtlApprovalHandler() {
    this.updateStatus("Submitted to CRMT");
  }
  updateStatus() {
    console.log("Status: " + this.selectedStatus);
    this.submitRequest(this.selectedStatus);
  }
  statusChangeHandler(event) {
    this.selectedStatus = event.target.value;
    console.log(" newStatusHandler: Status: " + this.selectedStatus);
    this.isButtonDisabled = false;
  }
  handleChange(event) {
    this.value = event.detail.value;
  }

  get acceptedFormats() {
    return [".pdf", ".png"];
  }

  openConfirmationDialogue() {
    if (this.isCorgtl) {
      this.selectedStatus = "Submitted to CRMT";
    }
    console.log("this.selectedStatus: " + this.selectedStatus);
    if (this.selectedStatus === undefined) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Please select new status",
          message: "",
          variant: "error"
        })
      );
      return false;
    }
    this.confirmDialogue = true;
    return true;
  }

  closeModal() {
    this.confirmDialogue = false;
  }

  submitRequest(status) {
    this.confirmDialogue = false;
    this.showSpinner = true;
    // Create the recordInput object
    const fields = {};
    fields[ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    fields[OCEAN_STATUS_FIELD.fieldApiName] = status;
    const recordInput = { fields: fields };
    updateRecord(recordInput)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Status has been updated successfully!",
            variant: "success"
          })
        );
        this.showSpinner = false;
      })
      .catch(error => {
        this.showSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error submitting status change. Please try again",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }
}
