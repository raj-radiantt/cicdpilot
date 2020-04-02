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
import { getPricingByResourceType } from "c/oceanPricingService";
import getResourceRequestInstances from "@salesforce/apex/OceanController.getResourceRequestInstances";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Clone", name: "Clone" },
  { label: "Remove", name: "Remove" }
];

const readOnlyActions = [{ label: "View", name: "View" }];

export default class OceanCRRForm extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  @api serviceMetaData;
  @track displayFields = [];
  @track createFields = [];
  @track viewFields = [];
  @track editFields = [];
  @track showEc2Table = false;
  @track error;
  @track ec2Instances = [];
  @track totalEc2Price = 0;
  @track record = [];
  @track bShowModal = false;
  @track addNote = false;
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
  @track priceIsZero = false;
  @track showDeleteModal = false;
  @track showPrice = true;

  pageSize = 10;
  ec2InstanceTypes = [];
  emptyFileUrl = EMPTY_FILE;
  selectedRecords = [];
  refreshTable;
  error;
  initialRender = true;

  refreshData() {
    return refreshApex(this._wiredResult);
  }

  connectedCallback() {
    this.showPrice =
      this.serviceMetaData.AWS_Resource_Name__c !== "Other Service";
    this.buildRequestForms();
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
    const userActions =
      this.formMode === "readonly" ? readOnlyActions : actions;
    //modify displayFields supplied to the form data table
    this.displayFields.push({
      type: "action",
      typeAttributes: { rowActions: userActions },
      cellAttributes: { alignment: "left", class: { fieldName: "Modify__c" } }
    });
  }

  buildRequestForms() {
    let fields = [...this.serviceMetaData.CRR_UI_Field__r];
    fields.sort((a, b) => a.Sequence__c - b.Sequence__c);
    //Format create form fields
    let createFields = fields.filter(f => f.Create__c);
    this.createFields = createFields.map(f => {
      return {
        fieldApiName: f.Field_API_Name__c,
        objectApiName: this.serviceMetaData.Resource_API_Name__c
      };
    });
    //Format display form fields
    let displayFields = fields.filter(f => f.Display__c);
    displayFields.sort((a, b) => a.Display_Sequence__c - b.Display_Sequence__c);
    this.displayFields = displayFields.map(f => {
      return {
        label: f.MasterLabel,
        fieldName: f.Field_API_Name__c,
        type: f.Field_Type__c ? f.Field_Type__c.toLowerCase() : "text",
        cellAttributes: { alignment: "left", class: { fieldName: "Modify__c" } }
      };
    });
    //Format view form fields
    let viewFields = fields.filter(f => f.View__c);
    this.viewFields = viewFields.map(f => {
      return {
        fieldApiName: f.Field_API_Name__c,
        objectApiName: this.serviceMetaData.Resource_API_Name__c
      };
    });
    //Format edit form fields
    let editFields = fields.filter(f => f.Edit__c);
    this.editFields = editFields.map(f => {
      return {
        fieldApiName: f.Field_API_Name__c,
        objectApiName: this.serviceMetaData.Resource_API_Name__c
      };
    });
  }

  handleEc2ComputeRowActions(event) {
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
    const awsAccountId = currentRow["AWS_Accounts__c"];
    this.selectedAwsAccountLabel = this.currentOceanRequest.applicationDetails.awsAccounts.filter(
      a => a.value === awsAccountId
    )[0].label;
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = currentRow;
  }
  // Clone the current record details
  cloneCurrentRecord(currentRow) {
    currentRow.Id = undefined;
    currentRow.Name = undefined;
    const fields = currentRow;
    this.createEc2Instance(fields);
  }
  // closing modal box
  closeModal() {
    this.bShowModal = false;
    this.addNote = false;
  }
  editCurrentRecord(row) {
    // open modal box
    this.selectedAwsAccountForUpdate = row["AWS_Accounts__c"];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleEc2ComputeSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveInstance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleEc2ComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance() {
    this.showLoadingSpinner = true;
    this.showDeleteModal = false;
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message:
              this.serviceMetaData.AWS_Resource_Name__c +
              " instance has been removed",
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

  closePriceAlertModal() {
    this.priceIsZero = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  submitEc2ComputeHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields["AWS_Accounts__c"] = this.selectedAwsAccount;
    this.createEc2Instance(fields);
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  createEc2Instance(fields) {
    delete fields.id;
    fields["Ocean_Request_Id__c"] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveInstance(fields);
  }

  saveInstance(fields) {
    this.showLoadingSpinner = true;
    getPricingByResourceType(this.serviceMetaData.AWS_Resource_Name__c, fields)
      .then(response => {
        if (this.serviceMetaData.AWS_Resource_Name__c !== "Other Service")
          fields["Calculated_Cost__c"] = parseFloat(response);
        const recordInput = {
          apiName: this.serviceMetaData.Resource_API_Name__c,
          fields
        };
        if (this.currentRecordId) {
          this.updateEC2Record(recordInput, fields);
        } else {
          this.createEC2Record(recordInput, fields);
        }
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: this.serviceMetaData.AWS_Resource_Name__c + " Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      });
  }

  updateEC2Record(recordInput, fields) {
    delete recordInput.apiName;
    fields["Id"] = this.currentRecordId;
    fields["AWS_Accounts__c"] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        if (
          this.serviceMetaData.AWS_Resource_Name__c !== "Other Service" &&
          fields.Calculated_Cost__c === 0.0
        ) {
          this.priceIsZero = true;
        }
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message:
              "Success! " +
              this.serviceMetaData.AWS_Resource_Name__c +
              " instance has been updated!",
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

  createEC2Record(recordInput, fields) {
    createRecord(recordInput)
      .then(response => {
        fields.Id = response.id;
        fields.oceanRequestId = this.currentOceanRequest.id;
        if (
          this.serviceMetaData.AWS_Resource_Name__c !== "Other Service" &&
          fields.Calculated_Cost__c === 0.0
        ) {
          this.priceIsZero = true;
        }
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message:
              "Success! " +
              this.serviceMetaData.AWS_Resource_Name__c +
              " instance has been created!",
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
    getResourceRequestInstances({
      resourceType: this.serviceMetaData.AWS_Resource_Name__c,
      oceanRequestId: this.currentOceanRequest.id,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    })
      .then(result => {
        this.ec2Instances = result;
        this.rows = [];
        this.rows = this.ec2Instances;
        this.showEc2Table = this.ec2Instances.length > 0;
      })
      .catch(error => {
        this.dispatchEvent(showErrorToast(error));
        this.ec2Instances = null;
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  constructPagination() {
    getCostAndCount({
      sObjectName: this.serviceMetaData.Resource_API_Name__c,
      oceanRequestId: this.currentOceanRequest.id
    })
      .then(result => {
        if (result) {
          this.totalEc2Price = parseFloat(result.totalCost) || 0;
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

  notesModel() {
    this.addNote = true;
  }

  handleCancelEdit() {
    this.bShowModal = false;
  }
}
