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
import IS_COR from "@salesforce/schema/User.Contact.Is_COR__c";
import IS_READONLY from "@salesforce/schema/User.Contact.Read_Only_User__c";
import IS_GTL from "@salesforce/schema/User.Contact.Is_GTL__c";
import IS_CRMS from "@salesforce/schema/User.Contact.Is_CRMS__c";
import getProjectDetails from "@salesforce/apex/OceanController.getProjectDetails";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord } from "lightning/uiRecordApi";
import getAwsAccountNames from "@salesforce/apex/OceanController.getAwsAccountNames";

export default class Header extends LightningElement {
  @track showRequest = false;
  @track totalEc2ComputePrice;
  @track totalRequestCost = 0.0;
  @track requestType;
  @wire(CurrentPageReference) pageRef;
  oceanLogoUrl = OCEAN_LOGO;
  @track isAdoRequestor;
  @track isCOR;
  @track isReadonlyUser;
  @track isGTL;
  @track isCRMS;
  @track error;
  @track email;
  @track name;
  @track adoName;
  @track projectName;
  @track projectNumber;
  @track project;
  @track currentProjectDetails;
  @track confirmDetails;
  @track applicationName;
  @track projectAcronym;
  @track applications = [];
  @track currentProject = {};
  @wire(getRecord, {
    recordId: USER_ID,
    fields: [NAME_FIELD, EMAIL_FIELD, ADONAME_FIELD, IS_COR, IS_GTL, IS_CRMS, IS_READONLY]
  })
  wireuser({ error, data }) {
    if (error) {
      this.error = error;
    } else if (data) {
      if(data.fields){
        this.email = data.fields.Email.value;
        this.name = data.fields.Name.value;
        if(data.fields.Contact && data.fields.Contact.value && data.fields.Contact.value.fields) {
          this.adoName = data.fields.Contact.value.fields.Account.displayValue;
          this.adoId = data.fields.Contact.value.fields.Account.value.id;
          this.isCOR = data.fields.Contact.value.fields.Is_COR__c.value;
          this.isGTL = data.fields.Contact.value.fields.Is_GTL__c.value;
          this.isCRMS = data.fields.Contact.value.fields.Is_CRMS__c.value;
          this.isReadonlyUser = data.fields.Contact.value.fields.Read_Only_User__c.value;
          this.getCurrentProjectDetails();
          console.log('Is COR ' + this.isCOR);
          console.log('Is isGTL ' + this.isGTL);
          console.log('Is isCRMS ' + this.isCRMS);
          console.log('Is isReadonlyUser ' + this.isReadonlyUser);
          this.isAdoRequestor = !(this.isCOR && this.isGTL && this.isCRMS && this.isReadonlyUser);
          localStorage.setItem('isAdoRequestor', this.isAdoRequestor);
          localStorage.setItem('isReadonlyUser', this.isReadonlyUser);
          console.log('Is isReadonlyUser ' + this.isAdoRequestor);
        }
      }
    }
  }
  handleAppSelection(event) {
    const index = event.currentTarget.dataset.value;
    this.currentProject.adoId = this.adoId;
    this.currentProject.applicationId = this.currentProjectDetails[index].Id;
    this.currentProject.projectNumber = this.currentProjectDetails[index].Project_Acronym__r.Project_Number__c;
    this.currentProject.projectName = this.currentProjectDetails[index].Project_Acronym__r.Name;
    this.currentProject.applicationName = this.currentProjectDetails[index].Name;
    fireEvent(this.pageRef, "newRequest", {currentProject:this.currentProject, showRequest: true});
  }

  getCurrentProjectDetails() {
    getProjectDetails({ adoId: this.adoId })
      .then(result => {
        this.applications = [];
        this.currentProjectDetails = result;
        this.projectNumber = this.currentProjectDetails[0].Project_Acronym__r.Project_Number__c;
        this.projectName = this.currentProjectDetails[0].Project_Acronym__r.Name;
        this.currentProjectDetails.forEach(element => {
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

  
  getAwsAccounts() {
    getAwsAccountNames({ project: this.currentcurrentProjectDetails.projectName})
      .then(result => {
        if(result && result.length > 0) {
          const awsAccountNames = result[0].AWS_Accounts__c.split(';');
          const accounts = [];
          awsAccountNames.forEach( (element) => {
            accounts.push({label:element, value:element });
          });
          this.currentcurrentProjectDetails.awsAccounts = accounts;
          // console.log('AWS Accounts: ' + this.currentcurrentProjectDetails.awsAccounts);
        }
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error while fetching AWS account names",
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

  handleLogout() {
    window.location.replace("https://oceandsg1-oceandev.cs32.force.com/servlet/networks/switch?startURL=%2Fsecur%2Flogout.jsp");
  }
}