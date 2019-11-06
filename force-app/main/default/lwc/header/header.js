/* eslint-disable no-console */
import { LightningElement, track, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { fireEvent } from "c/pubsub";
import OCEAN_LOGO from "@salesforce/resourceUrl/oceanlogo";
import USER_ID from "@salesforce/user/Id";
import NAME_FIELD from "@salesforce/schema/User.Name";
import EMAIL_FIELD from "@salesforce/schema/User.Email";
import ADONAME_FIELD from "@salesforce/schema/User.Contact.Account.Name";
import getProjectDetails from "@salesforce/apex/OceanController.getProjectDetails";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord } from "lightning/uiRecordApi";

export default class Header extends LightningElement {
  @track showRequest = false;
  @track totalEc2ComputePrice;
  @track totalRequestCost = 0.0;
  @track requestType;
  @wire(CurrentPageReference) pageRef;
  oceanLogoUrl = OCEAN_LOGO;

  @track error;
  @track email;
  @track name;
  @track adoName;
  @track projectName;
  @track projectNumber;
  @track project;
  @track projectDetails;
  @track confirmDetails;
  @track applicationName;
  @track projectAcronym;
  @track applications = [];
  @track currentProject = {};
  @wire(getRecord, {
    recordId: USER_ID,
    fields: [NAME_FIELD, EMAIL_FIELD, ADONAME_FIELD]
  })
  wireuser({ error, data }) {
    if (error) {
      this.error = error;
    } else if (data) {
      if(data.fields){
        console.log('Data Fields: ' + JSON.stringify(data.fields));
        this.email = data.fields.Email.value;
        this.name = data.fields.Name.value;
        if(data.fields.Contact && data.fields.Contact.value && data.fields.Contact.value.fields) {
          this.adoName = data.fields.Contact.value.fields.Account.displayValue;
          this.adoId = data.fields.Contact.value.fields.Account.value.id;
          this.getProjectDetails();
        }
      }
    }
  }
  handleAppSelection(event) {
    console.log(" in function")
    const index = event.currentTarget.dataset.value;
    this.currentProject.adoId = this.adoId;
    this.currentProject.applicationId = this.projectDetails[index].Id;
    this.currentProject.projectNumber = this.projectDetails[index].Project_Acronym__r.Project_Number__c;
    this.currentProject.projectName = this.projectDetails[index].Project_Acronym__r.Name;
    this.currentProject.applicationName = this.projectDetails[index].Name;
    // fireEvent(this.pageRef, "newRequest", true);
    fireEvent(this.pageRef, "newRequest", {currentProject:this.currentProject, showRequest: true});
  }

  getProjectDetails() {
    getProjectDetails({ adoId: this.adoId })
      .then(result => {
        this.applications = [];
        this.projectDetails = result;
        this.projectNumber = this.projectDetails[0].Project_Acronym__r.Project_Number__c;
        this.projectName = this.projectDetails[0].Project_Acronym__r.Name;
        this.projectDetails.forEach(element => {
          this.applications.push(element);
        });
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
  connectedCallback() {
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    registerListener("totalEc2ComputePrice", this.handleEc2PriceChange, this);
  }
  disconnectedCallback() {
    unregisterAllListeners(this);
  }
  continueConfirm() {
    fireEvent(this.pageRef, "currentProject", this.currentProject);
    fireEvent(this.pageRef, "newRequest", true);
    this.confirmDetails = false;
  }

  handleNewRequest() {
    this.showRequest = true;
  }

  confirmDialog(){
    this.confirmDetails = true;
  }

  closeConfirm(){
    this.confirmDetails = false;
  }

  handleEc2PriceChange(inpVal) {
    this.totalEc2ComputePrice = inpVal;
    this.totalRequestCost = parseFloat(this.totalEc2ComputePrice).toFixed(2);
  }
  showDrafts() {
    fireEvent(this.pageRef, "showOceanRequests", 'Draft');
  }
  showPending() {
    fireEvent(this.pageRef, "showOceanRequests", 'Pending');
  }
  showApproved() {
    fireEvent(this.pageRef, "showOceanRequests", 'Approved');
  }
  showOceanHome() {
    fireEvent(this.pageRef, "showOceanRequests", 'home');
  }
}