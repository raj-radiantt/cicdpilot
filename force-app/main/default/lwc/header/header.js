/* eslint-disable no-console */
import { LightningElement, track, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { fireEvent } from "c/pubsub";

export default class Header extends LightningElement {
  @track totalEc2ComputePrice;
  @track totalRequestCost = 0.0;
  @wire(CurrentPageReference) pageRef;

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

  handleEc2PriceChange(inpVal) {
    this.totalEc2ComputePrice = inpVal;
    this.totalRequestCost = parseFloat(this.totalEc2ComputePrice).toFixed(2);
    console.log('Updated Request Cost (ec2) in header : ' + this.totalRequestCost);
  }
  showDraftRequestsHandler() {
    fireEvent(this.pageRef, "showDraftRequests", true);
  }
}
