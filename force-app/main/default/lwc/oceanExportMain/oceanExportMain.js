/* eslint-disable no-console */

import { LightningElement, api, track } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/xlsx";

export default class OceanExportMain extends LightningElement {
  @api headerList;
  @api filename;
  @api worksheetNameList;
  @api sheetData;
  @track item;
  @track index;
  librariesLoaded = false;

  renderedCallback() {
    console.log("renderedCallback xlsx");
    if (this.librariesLoaded) return;
    this.librariesLoaded = true;
    Promise.all([loadScript(this, workbook + "/xlsx/xlsx.full.min.js")])
      .then(() => {
        console.log("success");
      })
      .catch(() => {
        console.log("failure");
      });
    }

      @api download(){
        const XLSX = window.XLSX;
        let xlsData = this.sheetData;
        let xlsHeader = this.headerList;
        let ws_name = this.worksheetNameList;
        let createXLSLFormatObj = Array(xlsData.length).fill([]);
        /* creating new Excel */
        var wb = XLSX.utils.book_new();        
        /* creating new worksheet */
        var ws = Array(createXLSLFormatObj.length).fill([]);
        /* form header list */
         // eslint-disable-next-line no-return-assign
         xlsHeader.forEach((item, index) => createXLSLFormatObj[index] = [item])   
        /* form data key list */
          xlsData.forEach((item, selectedRowIndex)=> {
              let xlsRowKey = Object.keys(item[0]);
              // eslint-disable-next-line no-unused-vars
              item.forEach((value, index) => {
                  var innerRowData = [];
                  // eslint-disable-next-line no-shadow
                  xlsRowKey.forEach(item=>{
                      innerRowData.push(value[item]);
                  })
                  createXLSLFormatObj[selectedRowIndex].push(innerRowData);
              })
            });
            
            for (let i = 0; i < ws.length; i++) {
              /* converting data to excel format and puhing to worksheet */
              let data = XLSX.utils.aoa_to_sheet(createXLSLFormatObj[i]);
              ws[i] = [...ws[i], data];
        
              /* Add worksheet to Excel */
              XLSX.utils.book_append_sheet(wb, ws[i][0], ws_name[i]);
            }
        
            /* Write Excel and Download */
            XLSX.writeFile(wb, this.filename);
          }
  }