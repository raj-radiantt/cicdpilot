import { LightningElement, api, track  } from 'lwc';

export default class adminReview extends LightningElement {
    @api myRecordId;
    statusOptions = [ 
        { label: 'Draft', value: 'Draft' },
        { label: 'ADO Submitted', value: 'ADO Submitted' },
        { label: 'COR Approved', value: 'COR Approved' },
        { label: 'CRMT Intake Review', value: 'CRMT Intake Review' },
        { label: 'CRMT Intake Review Completed', value: 'CRMT Intake Review Completed' },
        { label: 'ROM Requested', value: 'ROM Requested' },
        { label: 'ROM Received', value: 'ROM Received' },
        { label: 'ROM Approved', value: 'ROM Approved' },
        { label: 'RFP Requested', value: 'RFP Requested' },
        { label: 'RFP Received', value: 'RFP Received' },
        { label: 'RFP Approved', value: 'RFP Approved' },
        { label: 'Approved', value: 'Approved' },
    ];
    @track status;
    get acceptedFormats() {
        return ['.pdf', '.png'];
    }
}