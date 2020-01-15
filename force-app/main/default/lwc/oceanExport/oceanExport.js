/* eslint-disable no-console */
import { LightningElement, track, api } from "lwc";
import getDataForExport from "@salesforce/apex/OceanExport.getDataForExport";

export default class OceanExport extends LightningElement {
  @api currentOceanRequest;
  @track xlsHeader = []; // store all the headers of the the tables
  @track workSheetNameList = []; // store all the sheets name of the the tables
  @track xlsData = []; // store all tables data
  @track filename = "OceanRequestsWithInstances.xlsx"; // Name of the file
  @track requestData = []; // used only for storing request table
  @track ec2Data = []; // used only for storing ec2 table

  connectedCallback() {   
    //apex call for bringing the Ocean Requests data 
    
    getDataForExport({
      oceanRequestId:this.currentOceanRequest.id
    })
      .then(result => {
        console.log(result);        
        Object.keys(result).forEach(requestKey => {
          const requestArr = result[requestKey];
          if(requestArr.length > 0){
            const header = Object.keys(requestArr[0]);
            const data = [...requestArr];
            this.xlsFormatter(header,data, requestKey);
          }
        });
        
      })
      .catch(error => {
        console.error(error);
      });
  }

  // formating the data to send as input to  xlsxMain component
  xlsFormatter(header, data, sheetName) {
    console.log(header,data,sheetName);
    this.xlsHeader.push(header);
    this.workSheetNameList.push(sheetName);
    this.xlsData.push(data);
  }

   // calling the download function from xlsxMain.js 
  download() {
    this.template.querySelector("c-ocean-export-main").download();
  }

}