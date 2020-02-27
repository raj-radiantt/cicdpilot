/* eslint-disable no-console */
import { LightningElement, track, wire, api } from "lwc";
import {
  createRecord,
  updateRecord,
  deleteRecord
} from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";
import { showErrorToast } from "c/oceanToastHandler";
//import getOtherRequestPrice from "@salesforce/apex/OceanAwsPricingData.getOtherRequestPrice";
import getOtherRequests from "@salesforce/apex/OceanController.getOtherRequests";
import ID_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Id";
import ADO_Notes_FIELD from "@salesforce/schema/Ocean_Other_Request__c.ADO_Notes__c";
import Application_Component_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Application_Component__c";
import AWS_Region_FIELD from "@salesforce/schema/Ocean_Other_Request__c.AWS_Region__c";
import AWS_SERVICE_FIELD from "@salesforce/schema/Ocean_Other_Request__c.AWS_Service__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/Ocean_Other_Request__c.AWS_Accounts__c";
import Environment_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Environment__c";
import QTY_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Quantity__c";
import Number_Of_Months_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Number_of_Months_Requested__c";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Ocean_Request_Id__c";
import UNIT_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Unit__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Calculated_Cost__c";
import Resource_Status_FIELD from "@salesforce/schema/Ocean_Other_Request__c.Resource_Status__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const COLS1 = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  AWS_SERVICE_FIELD,
  QTY_FIELD,
  UNIT_FIELD,
  Number_Of_Months_FIELD,
  ADO_Notes_FIELD, 
  CALCULATED_COST_FIELD
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Clone", name: "Clone" },
  { label: "Remove", name: "Remove" }
];

const readOnlyActions = [{ label: "View", name: "View" }];

const COLS2 = [
  { label: 'Date', fieldName: 'date' },
  { label: 'Notes', fieldName: 'notes', type: 'note' },
];

const COLS = [
  { label: "Request Id", fieldName: "Name", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  { label: "Environment", fieldName: "Environment__c", type: "text" },
  { label: "AWS Service", fieldName: "AWS_Service__c", type: "text" },
  { label: "Unit", fieldName: "Unit__c", type: "text" },
  { label: "Quantity", fieldName: "Quantity__c", type: "number", cellAttributes: { alignment: "left" } },
  { label: "Application Component", fieldName: "Application_Component__c", type: "text" },
  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];

export default class OceanOtherRequest extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  
  @track showOtherRequestTable = false;
  @track error;
  @track columns = COLS;
  @track columns1 = COLS1;
  @track columns2= COLS2;
  @track otherRequests = [];
  @track totalOtherRequestPrice = 0;
  @track addNote = false;
  @track record = [];
  @track bShowModal = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track selectedAwsAccountLabel;
  @track pageNumber = 1;
  @track recordCount;
  @track pageCount;
  @track pages;
  @track showPagination;
  @track showDeleteModal = false;

  pageSize = 10;
  emptyFileUrl = EMPTY_FILE;
  selectedRecords = [];
  refreshTable;
  error;
  initialRender = true;

  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.initViewActions();
    this.updateTableData();
  }

  renderedCallback() {
    this.viewInit();
  }

  viewInit() {
    if (this.initialRender) {
      const pageElement = this.template.querySelector(
        '[data-id="page-buttons"]'
      );
      if (pageElement) {
        pageElement.classList.add("active-page");
        this.initialRender = false;
      }
    }
  }

  initViewActions() {
    this.columns = [...COLS];
    const userActions =
      this.formMode === "readonly" ? readOnlyActions : actions;
    //modify columns supplied to the form data table
    this.columns.push({
      type: "action",
      typeAttributes: { rowActions: userActions }
    });
  }

  handleOtherRequestRowActions(event) {
    let actionName = event.detail.action.name;
    let row = event.detail.row;
    this.currentRecordId = row.Id;
    // eslint-disable-next-line default-case
    switch (actionName) {
      case "View":
        this.viewCurrentRecord(row);
        break;
      case "Edit":
        this.editCurrentRecord(row);
        break;
      case "Clone":
        this.cloneCurrentRecord(row);
        break;
      case "Remove":
        this.showDeleteModal = true; 
        break;
    }
  }

  // view the current record details
  viewCurrentRecord(currentRow) {
    const awsAccountId = currentRow[AWS_ACCOUNT_FIELD.fieldApiName];
    this.selectedAwsAccountLabel = this.currentOceanRequest.applicationDetails.awsAccounts.filter(a => a.value === awsAccountId)[0].label;
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = currentRow;
  }

  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createOtherRequest(fields);
  }

  // closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }

  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleOtherRequestSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveOtherRequest(event.detail.fields);
    this.bShowModal = false;
  }

  // refreshing the datatable after record edit form success
  handleOtherRequestSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteOtherRequest() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;  
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Other Request has been removed",
            variant: "success"
          })
        );
        this.pageNumber =
          (this.recordCount - 1) % this.pageSize === 0 ? 1 : this.pageNumber;
        if (this.pageNumber === 1) {
          const el = this.template.querySelector('[data-id="page-buttons"]');
          if (el) el.classList.add("active-page");
        }
        this.updateTableData();
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While Deleting record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }
 
  closeDeleteModal(){
    this.showDeleteModal = false;
  }


  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  submitOtherRequestHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createOtherRequest(fields);
  }

  createOtherRequest(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveOtherRequest(fields);
  }


saveOtherRequest(fields) {
    const recordInput = { apiName: "Ocean_Other_Request__c", fields };
    if (this.currentRecordId) {
        this.updateOtherRecord(recordInput, fields);
    } else {
        this.createOtherRecord(recordInput, fields);
    }
  }

  updateOtherRecord(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Other Request has been updated!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error While fetching record",
            message: error.message,
            variant: "error"
          })
        );
      });
  }

  createOtherRecord(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! Other Service has been created!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.showLoadingSpinner = false;
      });
  }

  getRecordPage(e) {
    const page = e.target.value;
    if (page) {
      this.toggleActiveClassForPage(e);
      this.pageNumber = page;
      this.updateTableData();
    }
  }

  toggleActiveClassForPage(e) {
    const id = e.target.dataset.id;
    this.template.querySelectorAll(`[data-id="${id}"]`).forEach(el => {
      el.classList.remove("active-page");
    });
    e.target.classList.add("active-page");
  }

  updateTableData() {
    this.constructPagination();
    getOtherRequests({ 
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize 
    })
      .then(result => {
        this.otherRequests = result;
        this.rows = [];
        this.rows = this.otherRequests;
        this.showOtherRequestTable = this.otherRequests.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.otherRequests = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: "Ocean_Other_Request__c",
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalOtherRequestPrice = parseFloat(result.totalCost) || 0;
          this.recordCount = parseInt(result.recordCount, 10);
          this.pageCount = Math.ceil(this.recordCount / this.pageSize) || 1;
          this.pages = [];
          this.pageNumber =
            this.pageNumber > this.pageCount ? this.pageCount : this.pageNumber;
          let i = 1;
          // eslint-disable-next-line no-empty
          while (this.pages.push(i++) < this.pageCount) {}
          this.showPagination = this.pages.length > 1;
        }
      })
      .catch(error => this.dispatchEvent(showErrorToast(error)));
  }

  getPricingRequestData(instance) {
    var dbs = instance.DB_Engine_License__c.split(",").map(s => s.trim());
    var [db, dbEdition, dbLicense] = [dbs[0], "", ""];
    var [offeringClass, termType, leaseContractLength, purchaseOption] = [
      "",
      "",
      "",
      ""
    ];
    var fundingTypes = instance.Funding_Type__c.split(",").map(s => s.trim());
    if (dbs.length === 2) {
      dbLicense = dbs[1];
    } else if (dbs.length > 2) {
      [dbEdition, dbLicense] = [dbs[1], dbs[2]];
    }
    if (fundingTypes.length > 1) {
      [offeringClass, termType, leaseContractLength, purchaseOption] = [
        fundingTypes[0],
        fundingTypes[1],
        fundingTypes[2],
        fundingTypes[3]
      ];
    } else {
      termType = fundingTypes[0];
    }
    return {
      pricingRequest: {
        databaseEngine: db,
        licenseModel: dbLicense,
        databaseEdition: dbEdition,
        termType: termType,
        leaseContractLength: leaseContractLength,
        purchaseOption: purchaseOption,
        offeringClass: offeringClass,
        region: instance.AWS_Region__c,
        instanceType: instance.InstanceType__c,
        deploymentOption: instance.Deployment__c
      }
    };
  }

  notesModel() {
    this.addNote = true;
  }
  handleCancelEdit() {
    this.bShowModal = false;
  }
}