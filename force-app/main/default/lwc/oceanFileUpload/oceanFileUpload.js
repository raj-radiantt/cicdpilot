/* eslint-disable no-console */
import { LightningElement, track, api } from 'lwc';
import saveFile from '@salesforce/apex/OceanFileController.saveFile';
import releatedFiles from '@salesforce/apex/OceanFileController.releatedFiles';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const columns = [
    {label: 'Title', fieldName: 'Title'}
];

export default class OceanFileUpload extends LightningElement {
    @api recordId;
    @api oceanRequestId;
    @api isAdoRequestor;
    @track columns = columns;
    @track data;
    @track fileName = '';
    @track UploadFile = 'Upload File';
    @track showLoadingSpinner = false;
    @track isTrue = false;
    selectedRecords;
    filesUploaded = [];
    options1 = [ { label: 'Onboarding Document', value: 'Onboarding' }];
    options2 = [ 
        { label: 'Onboarding Document', value: 'Onboarding' },
        { label: 'RFP Document', value: 'RFP' },
        { label: 'ROM Document', value: 'ROM' },
    ];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 1500000;

    get options() {
        if(this.isAdoRequestor) {
            return this.options1;
        }  
        return this.options2;
    }

    handleChange(event) {
        this.value = event.detail.value;
    }


    connectedCallback() {
        // this.getRelatedFiles();
    }

    // getting file 
    handleFilesChange(event) {
        if(event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    handleSave() {
        if(this.filesUploaded.length > 0) {
            this.uploadHelper();
        }
        else {
            this.fileName = 'Please select file to upload!!';
        }
    }

    uploadHelper() {
        this.file = this.filesUploaded[0];
       if (this.file.size > this.MAX_FILE_SIZE) {
            window.console.log('File Size is to long');
            return ;
        }
        this.showLoadingSpinner = true;
        // create a FileReader object 
        this.fileReader= new FileReader();
        // set onload function of FileReader object  
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);
            
            // call the uploadProcess method 
            this.saveToFile();
        });
    
        this.fileReader.readAsDataURL(this.file);
    }

    // Calling apex class to insert the file
    saveToFile() {
        console.log('Ocean Request Id: ' + this.oceanRequestId);
        saveFile({ idParent: this.recordId, oceanReqId: this.oceanRequestId, strFileName: this.file.name, base64Data: encodeURIComponent(this.fileContents)})
        .then(result => {
            window.console.log('result ====> ' +result);
            // refreshing the datatable
            // this.getRelatedFiles();

            this.fileName = this.fileName + ' - Uploaded Successfully';
            this.UploadFile = 'File Uploaded Successfully';
            this.isTrue = true;
            this.showLoadingSpinner = false;

            // Showing Success message after file insert
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: this.file.name + ' - Uploaded Successfully!!!',
                    variant: 'success',
                }),
            );

        })
        .catch(error => {
            // Showing errors if any while inserting the files
            window.console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while uploading File',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }
    
    // Getting releated files of the current record
    getRelatedFiles() {
        releatedFiles({idParent: this.recordId})
        .then(data => {
            this.data = data;
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!!',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }

    // Getting selected rows to perform any action
    getSelectedRecords(event) {
        let conDocIds;
        const selectedRows = event.detail.selectedRows;
        conDocIds = new Set();
        // Display that fieldName of the selected rows
        for (let i = 0; i < selectedRows.length; i++){
            conDocIds.add(selectedRows[i].ContentDocumentId);
        }

        this.selectedRecords = Array.from(conDocIds).join(',');

        window.console.log('selectedRecords =====> '+this.selectedRecords);
    }

}