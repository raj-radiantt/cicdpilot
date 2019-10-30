/* eslint-disable no-console */
import { LightningElement, track, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { fireEvent } from "c/pubsub";
import OCEAN_LOGO from '@salesforce/resourceUrl/oceanlogo';
import USER_ID from '@salesforce/user/Id';
import NAME_FIELD from '@salesforce/schema/User.Name';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import ADONAME_FIELD from '@salesforce/schema/User.Contact.Account.Name';
import getProjectDetails from "@salesforce/apex/OceanController.getDraftRequests";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
    getRecord
} from 'lightning/uiRecordApi';

export default class Header extends LightningElement {
  @track showRequest = false;
  @track totalEc2ComputePrice;
  @track totalRequestCost = 0.0;
  @wire(CurrentPageReference) pageRef;
  oceanLogoUrl = OCEAN_LOGO;

  @track error ;
    @track email ; 
    @track name;
    @track adoName;
    @track projectDetails;
    @wire(getRecord, {
        recordId: USER_ID,
        fields: [NAME_FIELD, EMAIL_FIELD, ADONAME_FIELD]
    }) wireuser({
        error,
        data
    }) {
        if (error) {
           this.error = error ; 
        } else if (data) {
            this.email = data.fields.Email.value;
            this.name = data.fields.Name.value;
            this.adoName = data.fields.Contact.value.fields.Account.displayValue;
            this.adoId = data.fields.Contact.value.fields.Account.value.id;
            this.getProjectDetails();
        }
    }

    getProjectDetails() {
      console.log('ADO Id in getProjectDetails: ' + this.adoId);
      getProjectDetails({ adoId: this.adoId })
        .then(result => {
          console.log('result: '+JSON.stringify(result));
          this.projectDetails = result;
          console.log('Project Details: '+JSON.stringify(this.projectDetails));
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

  handleNewRequest() {
    this.showRequest = true;
  }

  handleEc2PriceChange(inpVal) {
    this.totalEc2ComputePrice = inpVal;
    this.totalRequestCost = parseFloat(this.totalEc2ComputePrice).toFixed(2);
  }
  showDraftRequestsHandler() {
    fireEvent(this.pageRef, "showDraftRequests", true);
  }
}