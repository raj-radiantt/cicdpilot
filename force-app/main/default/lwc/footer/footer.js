import { LightningElement } from 'lwc';
import FOOTER_LOGO from '@salesforce/resourceUrl/cmsfooterlogo';
import HHS_LOGO from '@salesforce/resourceUrl/hhslogo';

export default class Footer extends LightningElement {
    footerLogoUrl = FOOTER_LOGO;
    hhsLogoUrl = HHS_LOGO;
}