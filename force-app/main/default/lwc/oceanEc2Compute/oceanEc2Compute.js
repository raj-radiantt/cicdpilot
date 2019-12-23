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
import getAwsEc2Types from "@salesforce/apex/OceanDataOptions.getAwsEc2Types";
import getEc2ComputePrice from "@salesforce/apex/OceanAwsPricingData.getEc2ComputePrice";
import getEc2Instances from "@salesforce/apex/OceanController.getEc2Instances";
import OCEAN_REQUEST_ID_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Ocean_Request_Id__c";
import ID_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Id";
import QUANTITY_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Instance_Quantity__c";
import Resource_Status_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Resource_Status__c";
import Environment_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Environment__c";
import AWS_Region_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Region__c";
import ADO_Notes_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.ADO_Notes__c";
import AWS_ACCOUNT_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Accounts__c";
import Application_Component_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Application_Component__c";
import AWS_Availability_Zone_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.AWS_Availability_Zone__c";
import EC2_INSTANCE_TYPE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.EC2_Instance_Type__c";
import PLATFORM_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Platform__c";
import PerInstanceUptimePerDay_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.PerInstanceUptimePerDay__c";
import CALCULATED_COST_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Calculated_Cost__c";
import ADO_FUNDING_TYPE_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.ADO_FUNDING_TYPE__c";
import TENANCY_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Tenancy__c";
import PerInstanceUptimePerMonth_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.PerInstanceUptimePerMonth__c";
import NUMBER_OF_MONTHS_FIELD from "@salesforce/schema/OCEAN_Ec2Instance__c.Per_Instance_Running_Months_in_Remaining__c";
import EMPTY_FILE from "@salesforce/resourceUrl/emptyfile";
import getCostAndCount from "@salesforce/apex/OceanController.getCostAndCount";

const SUBMIT_COLS = [
  Resource_Status_FIELD,
  Application_Component_FIELD,
  Environment_FIELD,
  AWS_Region_FIELD,
  TENANCY_FIELD,
  AWS_Availability_Zone_FIELD,
  QUANTITY_FIELD,
  EC2_INSTANCE_TYPE_FIELD,
  PLATFORM_FIELD,
  NUMBER_OF_MONTHS_FIELD,
  PerInstanceUptimePerDay_FIELD,
  PerInstanceUptimePerMonth_FIELD,
  ADO_FUNDING_TYPE_FIELD,
  ADO_Notes_FIELD
];

// row actions
const actions = [
  { label: "View", name: "View" },
  { label: "Edit", name: "Edit" },
  { label: "Clone", name: "Clone" },
  { label: "Remove", name: "Remove" }
];

const readOnlyActions = [{ label: "View", name: "View" }];

const COLS = [
  { label: "Resource Request Id", fieldName: "Name", type: "text" },
  { label: "Status", fieldName: "Resource_Status__c", type: "text" },
  {
    label: "Environment",
    fieldName: "Environment__c",
    type: "text"
  },
  { label: "Platform", fieldName: "Platform__c", type: "text" },
  {
    label: "EC2 Instance Type",
    fieldName: "EC2_Instance_Type__c",
    type: "text"
  },
  {
    label: "Quantity",
    fieldName: "Instance_Quantity__c",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  { label: "Funding Type", fieldName: "ADO_FUNDING_TYPE__c", type: "text" },

  {
    label: "Estimated Cost",
    fieldName: "Calculated_Cost__c",
    type: "currency",
    cellAttributes: { alignment: "left" }
  }
];

export default class OceanEc2Compute extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @api currentOceanRequest;
  @api formMode;
  @track showEc2Table = false;
  @track error;
  @track columns = COLS;
  @track submitCols = SUBMIT_COLS;
  @track ec2Instances = [];
  @track totalEc2Price = 0.0;
  @track record = [];
  @track bShowModal = false;
  @track addNote = false;
  @track currentRecordId;
  @track isEditForm = false;
  @track showLoadingSpinner = false;
  @track selectedAwsAccount;
  @track selectedAwsAccountForUpdate;
  @track pageNumber = 1;
  @track recordCount;
  @track pageCount;
  @track pages;
  @track showPagination;

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
        this.deleteInstance(row);
        break;
    }
  }
  // view the current record details
  viewCurrentRecord(currentRow) {
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
    this.selectedAwsAccountForUpdate = row[AWS_ACCOUNT_FIELD.fieldApiName];
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleEc2ComputeSubmit(event) {
    this.showLoadingSpinner = true;
    event.preventDefault();
    this.saveEc2Instance(event.detail.fields);
    this.bShowModal = false;
  }
  // refreshing the datatable after record edit form success
  handleEc2ComputeSuccess() {
    return refreshApex(this.refreshTable);
  }

  deleteInstance(currentRow) {
    this.showLoadingSpinner = true;
    deleteRecord(currentRow.Id)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Ec2 instance has been removed",
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

  submitEc2ComputeHandler(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccount;
    this.createEc2Instance(fields);
  }

  awsAccountChangeHandler(event) {
    this.selectedAwsAccount = event.target.value;
  }

  awsAccountChangeHandlerForUpdate(event) {
    this.selectedAwsAccountForUpdate = event.target.value;
  }

  @wire(getAwsEc2Types)
  wiredResult(result) {
    if (result.data) {
      const conts = result.data;
      for (const key in conts) {
        if (Object.prototype.hasOwnProperty.call(conts, key)) {
          this.ec2InstanceTypes.push({ value: conts[key], label: key }); //Here we are creating the array to show on UI.
        }
      }
    }
  }

  createEc2Instance(fields) {
    this.showLoadingSpinner = true;
    delete fields.id;
    fields[OCEAN_REQUEST_ID_FIELD.fieldApiName] = this.currentOceanRequest.id;
    this.currentRecordId = null;
    this.saveEc2Instance(fields);
  }

  saveEc2Instance(fields) {
    var cost = 0;
    getEc2ComputePrice(this.getPricingRequestData(fields))
      .then(result => {
        if (result) {
          result.forEach(r => {
            cost +=
              r.Unit__c === "Quantity"
                ? parseFloat(r.PricePerUnit__c) *
                  parseInt(fields.Instance_Quantity__c, 10)
                : parseFloat(r.PricePerUnit__c) *
                  parseFloat(fields.PerInstanceUptimePerDay__c) *
                  parseInt(fields.PerInstanceUptimePerMonth__c, 10) *
                  parseInt(
                    fields.Per_Instance_Running_Months_in_Remaining__c,
                    10
                  ) *
                  parseInt(fields.Instance_Quantity__c, 10);
          });
        }
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "EC2 Pricing error",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        fields[CALCULATED_COST_FIELD.fieldApiName] = cost;
        const recordInput = { apiName: "OCEAN_Ec2Instance__c", fields };
        if (this.currentRecordId) {
          this.updateEC2Record(recordInput, fields);
        } else {
          this.createEC2Record(recordInput, fields);
        }
      });
  }

  updateEC2Record(recordInput, fields) {
    delete recordInput.apiName;
    fields[ID_FIELD.fieldApiName] = this.currentRecordId;
    fields[AWS_ACCOUNT_FIELD.fieldApiName] = this.selectedAwsAccountForUpdate;
    updateRecord(recordInput)
      .then(() => {
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! EC2 instance has been updated!",
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
        this.updateTableData();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Success! EC2 instance has been created!",
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
    getEc2Instances({
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
      sObjectName: "OCEAN_Ec2Instance__c",
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

  getPricingRequestData(instance) {
    var platforms = instance.Platform__c.split(",").map(s => s.trim());
    var [platform, preInstalledSW] = [
      platforms[0],
      platforms.length > 1 ? platforms[1] : ""
    ];
    var [offeringClass, termType, leaseContractLength, purchaseOption] = [
      "",
      "",
      "",
      ""
    ];
    var fundingTypes = instance.ADO_FUNDING_TYPE__c.split(",").map(s =>
      s.trim()
    );

    if (fundingTypes.length > 1)
      [offeringClass, termType, leaseContractLength, purchaseOption] = [
        fundingTypes[0],
        fundingTypes[1],
        fundingTypes[2],
        fundingTypes[3]
      ];
    else termType = fundingTypes[0];

    return {
      pricingRequest: {
        platform: platform,
        preInstalledSW: preInstalledSW,
        tenancy: instance.Tenancy__c,
        region: instance.AWS_Region__c,
        instanceType: instance.EC2_Instance_Type__c,
        offeringClass: offeringClass,
        termType: termType,
        leaseContractLength: leaseContractLength,
        purchaseOption: purchaseOption
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
