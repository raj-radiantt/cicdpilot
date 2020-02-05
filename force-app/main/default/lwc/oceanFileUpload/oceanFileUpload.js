/* eslint-disable no-console */
import { LightningElement, track, api } from "lwc";
import { deleteRecord } from "lightning/uiRecordApi";
import saveFile from "@salesforce/apex/OceanFileController.saveFile";
import relatedFiles from "@salesforce/apex/OceanFileController.relatedFiles";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const columns = [{ label: "Title", fieldName: "Title" }];

export default class OceanFileUpload extends LightningElement {
  @api currentUserAccess;
  @api currentOceanRequest;
  @track columns = columns;
  @track currentRecordId;
  @track data;
  @track fileName = "";
  @track UploadFile = "Upload File";
  @track fileType;
  @track showLoadingSpinner = false;
  @track isFileUploadDisabled = false;
  @track showFileName = false;
  @track showUploadError = false;
  @track uploadErrorText = "";
  selectedRecords;
  filesUploaded = [];
  options1 = [{ label: "Onboarding Document", value: "Onboarding" }];
  options2 = [
    { label: "Onboarding Document", value: "Onboarding Document" },
    { label: "Proposal Document", value: "Proposal Document" },
    { label: "ROM Document", value: "ROM Document" }
  ];
  file;
  fileContents;
  fileReader;
  content;
  MAX_FILE_SIZE = 1500000;

  get options() {
    const access = this.currentUserAccess.access;
    if (!access.CRMTFileUpload__c) {
      this.fileType = "Onboarding Document";
      return this.options1;
    }
    return this.options2;
  }

  handleChange(event) {
    this.fileType = event.detail.value;
  }

  connectedCallback() {
    this.activateAccessControls();
    this.getRelatedFiles();
  }
 
  activateAccessControls() {
    const requestStatus = this.currentOceanRequest.CRMTStatus;
    const access = this.currentUserAccess.access;
    this.isFileUploadDisabled = !(
      (access.FileUpload__c && requestStatus === "Draft") ||
      access.CRMTFileUpload__c
    );
  }

  // getting file
  handleFilesChange(event) {
    if (event.target.files.length > 0) {
      this.filesUploaded = event.target.files;
      this.fileName = event.target.files[0].name;
      this.showFileName = true;
      this.showUploadError = false;
    }
  }

  handleSave() {
    if (this.filesUploaded.length > 0) this.uploadHelper();
    else {
      this.showFileName = false;
      this.uploadErrorText = "Please select a file to upload";
      this.showUploadError = true;
    }
  }

  uploadHelper() {
    this.file = this.filesUploaded[0];
    if (this.file.size > this.MAX_FILE_SIZE) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error!!",
          message: "File Size is too big.",
          variant: "error"
        })
      );
      return;
    }
    this.showLoadingSpinner = true;
    // create a FileReader object
    this.fileReader = new FileReader();
    // set onload function of FileReader object
    this.fileReader.onloadend = () => {
      this.fileContents = this.fileReader.result;
      let base64 = "base64,";
      this.content = this.fileContents.indexOf(base64) + base64.length;
      this.fileContents = this.fileContents.substring(this.content);

      // call the uploadProcess method
      this.saveToFile();
    };

    this.fileReader.readAsDataURL(this.file);
  }

  // Calling apex class to insert the file
  saveToFile() {
    saveFile({
      idParent: this.currentOceanRequest.id,
      fileType: this.fileType,
      strFileName: this.file.name,
      base64Data: encodeURIComponent(this.fileContents)
    })
      .then(() => {
        // refreshing the datatable
        this.getRelatedFiles();
        this.fileName = "";
        this.showLoadingSpinner = false;

        // Showing Success message after file insert
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success!!",
            message: this.file.name + " - Uploaded Successfully!!!",
            variant: "success"
          })
        );
      })
      .catch(error => {
        // Showing errors if any while inserting the files
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error while uploading File",
            message: error.message,
            variant: "error"
          })
        );
      });
  }

  // Getting releated files of the current record
  getRelatedFiles() {
    relatedFiles({ idParent: this.currentOceanRequest.id })
      .then(data => {
        this.data = data;
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error!!",
            message: error.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        this.showLoadingSpinner = false;
      });
  }

  //Delete the selected file
  deleteFile(event) {
    this.showLoadingSpinner = true;
    this.currentRecordId = event.target.dataset.id;
    deleteRecord(this.currentRecordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "File has been deleted",
            variant: "success"
          })
        );
        this.getRelatedFiles();
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

  // Getting selected rows to perform any action
  getSelectedRecords(event) {
    let conDocIds;
    const selectedRows = event.detail.selectedRows;
    conDocIds = new Set();
    // Display that fieldName of the selected rows
    for (let i = 0; i < selectedRows.length; i++) {
      conDocIds.add(selectedRows[i].ContentDocumentId);
    }

    this.selectedRecords = Array.from(conDocIds).join(",");

    window.console.log("selectedRecords =====> " + this.selectedRecords);
  }
}
