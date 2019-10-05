/* eslint-disable no-console */
import { LightningElement, track, wire } from 'lwc';
import {  registerListener } from 'c/pubsub'; 
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

export default class Sidebar extends NavigationMixin(LightningElement) {
    @track requestServices;
    @wire(CurrentPageReference) pageRef;
    connectedCallback() //the subscriber method to be added inside connectedCallback method
    {
     registerListener('requestServices',this.getVal,this);
    }
     //'msg' is the same event name being fired
     //getval is the method using the event data for business operations
     getVal(val) //val is the data sent during the event - i.e. the cId on Sibling 1 component
     {
      this.requestServices = val;
      console.log('Setvoces Received: '+this.requestServices);
     }
}