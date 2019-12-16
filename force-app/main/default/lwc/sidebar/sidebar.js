/* eslint-disable no-console */
import { LightningElement, track, wire,api } from "lwc";
import { fireEvent } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";

export default class Sidebar extends LightningElement {
  static delegatesFocus = true;
  @track openApps = false;
  @track applications = [];
  @track currentProject;
  @track currentProjectDetails;
  @track isAdoRequestor;

  @api focusToElement(targetId){
    console.log(targetId);
    this.template.querySelector(`[data-id="ocean-nav-content"]`).focus();
  }
  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    if (!this.pageRef) {
      this.pageRef = {};
      this.pageRef.attributes = {};
      this.pageRef.attributes.LightningApp = "";
    }
    this.isAdoRequestor = localStorage.getItem("isAdoRequestor") === "true";
  }
  openAppDiv() {
    this.openApps = true;
  }

  populateApps() {
    if (localStorage.getItem("applications")) {
      this.applications = JSON.parse(localStorage.getItem("applications"));
    }
    if (localStorage.getItem("currentProjectDetails")) {
      this.currentProjectDetails = JSON.parse(
        localStorage.getItem("applications")
      );
    }
    console.log(
      "gettting applications from localstorage: " +
        JSON.stringify(this.applications)
    );
  }

  handleAppSelection(event) {
    const index = event.currentTarget.dataset.value;
    console.log("clicked event: " + JSON.stringify(event));
    this.currentProject.adoId = this.adoId;
    this.currentProject.applicationId = this.currentProjectDetails[index].Id;
    this.currentProject.projectNumber = this.currentProjectDetails[
      index
    ].Project_Acronym__r.Project_Number__c;
    this.currentProject.projectName = this.currentProjectDetails[
      index
    ].Project_Acronym__r.Name;
    this.currentProject.applicationName = this.currentProjectDetails[
      index
    ].Name;
    fireEvent(this.pageRef, "newRequest", {
      currentProject: this.currentProject,
      showRequest: true
    });
  }

  showDrafts() {
    fireEvent(this.pageRef, "showOceanRequests", "Draft");
  }
  showPending() {
    fireEvent(this.pageRef, "showOceanRequests", "Submitted");
  }
  showApproved() {
    fireEvent(this.pageRef, "showOceanRequests", "Approved");
  }
  showOceanHome() {
    fireEvent(this.pageRef, "showOceanRequests", "home");
  }
}
