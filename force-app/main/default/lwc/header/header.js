/* eslint-disable no-console */
import { LightningElement, track, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { fireEvent } from "c/pubsub";
import OCEAN_LOGO from '@salesforce/resourceUrl/oceanlogo';

export default class Header extends LightningElement {
  @track showRequest = false;
  @track totalEc2ComputePrice;
  @track totalRequestCost = 0.0;
  @wire(CurrentPageReference) pageRef;
  oceanLogoUrl = OCEAN_LOGO;

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
    console.log('Updated Request Cost (ec2) in header : ' + this.totalRequestCost);
  }
  showDraftRequestsHandler() {
    fireEvent(this.pageRef, "showDraftRequests", true);
  }
}