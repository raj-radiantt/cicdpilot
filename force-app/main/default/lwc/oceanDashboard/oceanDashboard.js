import { LightningElement, track } from "lwc";
import getCurrentOceanWave from "@salesforce/apex/OceanController.getCurrentOceanWave";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class oceanDashboard extends LightningElement {
  @track currWaveDueDate;
  @track nextWaveDueDate;

  connectedCallback() {
      this.getWaveDetails();
  }

  getWaveDetails() {
    getCurrentOceanWave()
      .then((result) => {
      
        if (result) {
          this.currWaveDueDate = result[0]
            ? result[0].ADO_Submission_Due_Date__c
            : undefined;
          this.nextWaveDueDate = result[1]
            ? result[1].ADO_Submission_Due_Date__c
            : undefined;
        }
      })
      .catch(error => {
        this.dispatchEvent(
            new ShowToastEvent({
              title: "Error on querying wave details",
              message: error.message,
              variant: "error"
            })
          );
      });
  }
}
