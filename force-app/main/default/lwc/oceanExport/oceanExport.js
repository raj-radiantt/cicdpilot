/* eslint-disable no-console */
import { LightningElement, track } from "lwc";
import getOceanRequestsForExport from "@salesforce/apex/OceanReport.getOceanRequestsForExport";
import getEc2InstancesForExport from "@salesforce/apex/OceanReport.getOceanRequestsForExport";
export default class OceanExport extends LightningElement {
  @track xlsHeader = []; // store all the headers of the the tables
  @track workSheetNameList = []; // store all the sheets name of the the tables
  @track xlsData = []; // store all tables data
  @track filename = "OceanRequestsWithInstances.xlsx"; // Name of the file
  @track requestData = []; // used only for storing account table
  @track ec2Data = []; // used only for storing contact table

  connectedCallback() {
    //apex call for bringing the Ec2 Instance data  
    getEc2InstancesForExport()
      .then(result => {
        console.log(result);
        this.ec2Header = Object.keys(result[0]);
        this.ec2Data = [...this.ec2Data, ...result];
        this.xlsFormatter(result, "Ec2 Instances");
      })
      .catch(error => {
        console.error(error);
      });
      
    //apex call for bringing the Ocean Requests data  
    getOceanRequestsForExport()
      .then(result => {
        console.log(result);
        this.requestHeader = Object.keys(result[0]);
        this.requestData = [...this.requestData, ...result];
        this.xlsFormatter(result, "Ocean Requests");
      })
      .catch(error => {
        console.error(error);
      });
  }

  // formating the data to send as input to  xlsxMain component
  xlsFormatter(data, sheetName) {
    let Header = Object.keys(data[0]);
    this.xlsHeader.push(Header);
    this.workSheetNameList.push(sheetName);
    this.xlsData.push(data);
  }

   // calling the download function from xlsxMain.js 
  download() {
    this.template.querySelector("c-ocean-Export-Main").download();
  }

}