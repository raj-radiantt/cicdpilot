/* eslint-disable no-console */
import { LightningElement, track, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { unregisterAllListeners } from "c/pubsub";
import { fireEvent } from "c/pubsub";
import OCEAN_LOGO from "@salesforce/resourceUrl/oceanlogo";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getCurrentUser from "@salesforce/apex/OceanUserAccessController.getCurrentUser";
import getApplications from "@salesforce/apex/OceanUserAccessController.getApplications";

export default class Header extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  oceanLogoUrl = OCEAN_LOGO;
  @track email;
  @track name;
  @track applications = [];

  connectedCallback() {
    this.init();
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
  }

  init() {
    getCurrentUser()
      .then(u => {
        this.name = u.Name;
        this.email = u.Email;
      })
      .catch(e => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error fetching user details",
            message: e.message,
            variant: "error"
          })
        );
      });

    getApplications()
      .then(a => {
        this.applications = a;
      })
      .catch(e => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error fetching application details",
            message: e.message,
            variant: "error"
          })
        );
      });
  }

  handleAppSelection(event) {
    const appName = event.target.label;
    const appId = event.target.value;
    fireEvent(this.pageRef, "newRequest", { appName: appName , appId :appId });
  }

  handleNewRequest() {
    this.showRequest = true;
  }

  confirmDialog() {
    this.confirmDetails = true;
  }

  closeConfirm() {
    this.confirmDetails = false;
  }

  showDrafts() {
    fireEvent(this.pageRef, "showOceanRequests", "Draft");
  }

  showSubmitted() {
    fireEvent(this.pageRef, "showOceanRequests", "Submitted");
  }

  showApproved() {
    fireEvent(this.pageRef, "showOceanRequests", "Approved");
  }

  showOceanHome() {
    fireEvent(this.pageRef, "showOceanRequests", "home");
  }

  handleLogout() {
    window.location.replace(
      "https://" + window.location.hostname + "/secur/logout.jsp"
    );
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }
}