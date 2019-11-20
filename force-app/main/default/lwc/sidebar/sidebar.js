/* eslint-disable no-console */
import { LightningElement, track } from "lwc";

export default class Sidebar extends LightningElement {
    @track openApps = false;

    openAppDiv(){
        this.openApps = true;
    }
}