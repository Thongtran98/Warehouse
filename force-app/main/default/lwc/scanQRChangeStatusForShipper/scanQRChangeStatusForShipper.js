import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import findRecord from '@salesforce/apex/scanQRChangeStatusForShipperController.findRecord';
import findSchedule from '@salesforce/apex/scanQRScheduleController.findSchedule';
// import findRecordType from '@salesforce/apex/scanQRChangeStatusSOController.findRecordType';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import ORDER_OBJECT from "@salesforce/schema/F_TMS_SO__c";

import STATUS_FIELD from '@salesforce/schema/F_TMS_SO__c.Status__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';

const FIELDS = ['F_TMS_SO__c.Schedule_Record_Type_Text__c'];


export default class ScanQRChangeStatusForShipper extends LightningElement {

    @api recordId;
    myScanner;
    scanButtonDisabled = false;
    scannedBarcode = '';
    name = '';
    recordType = '';


    // When component is initialized, detect whether to enable Scan button
    connectedCallback() {
        this.myScanner = getBarcodeScanner();
        if (this.myScanner == null || !this.myScanner.isAvailable()) {
            this.scanButtonDisabled = true;
        }
    }

    handleBeginScanClick(event) {
        // Reset scannedBarcode to empty string before starting new scan
        this.scannedBarcode = '';
        this.name = '';

        // Make sure BarcodeScanner is available before trying to use it
        // Note: We _also_ disable the Scan button if there's no BarcodeScanner
        if (this.myScanner != null && this.myScanner.isAvailable()) {
            const scanningOptions = {
                barcodeTypes: [this.myScanner.barcodeTypes.QR],
                instructionText: 'Scan a QR Code',
                successText: 'Scanning complete.'
            };
            this.myScanner
                .beginCapture(scanningOptions)
                .then((result) => {
                    console.log(result);

                    // Do something with the barcode scan value:
                    // - look up a record
                    // - create or update a record
                    // - parse data and put values into a form
                    // - and so on; this is YOUR code
                    // Here, we just display the scanned value in the UI
  
                    findRecord({ id: result.value})
                    .then((record) => {
                        console.log('1234');

                        const fields = {};
                        fields[ID_FIELD.fieldApiName] = result.value;
                        // fields[STATUS_FIELD.fieldApiName] = 'Đã xuất kho';
                        if(record.Status__c === 'Chấp nhận chuyển'){
                            fields[STATUS_FIELD.fieldApiName] = 'Đã lấy';
                        }else if(record.Status__c === 'Đã xuất kho'){
                            fields[STATUS_FIELD.fieldApiName] = 'Giao hàng thành công';
                        }

                        const recordInput = { 
        
                            fields};
                        if(record.Status__c === 'Đã xuất kho' || record.Status__c === 'Chấp nhận chuyển'){
                            updateRecord(recordInput)
                            .then((recordO) => {
                                this.scannedBarcode = 'Đơn hàng ' + record.Name +' đã được chuyển trạng thái ';
                                // this.scannedBarcode = result.value;
                                // this.name = record.Name;
                                if(record.Status__c === 'Đã xuất kho'){
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Đơn hàng ' +record.Name+ ' đã giao hàng thành công',
                                            // message: 'Đơn hàng ' + record.Name +' đã được chuyển trạng thái ',
                                            variant: 'success'
                                        })
                                    );
                                }else if(record.Status__c === 'Chấp nhận chuyển'){
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Đơn hàng ' +record.Name+ ' đã lấy thành công',
                                            // message: 'Đơn hàng ' + record.Name +' đã được chuyển trạng thái ',
                                            variant: 'success'
                                        })
                                    );
                                }
                                
                            })
                            .catch(error => {
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đơn hàng chuyển trạng thái không thành công.',
                                        // message: error.body.message,
                                        variant: 'error'
                                    })
                                );
                            });
                        }else{
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Đơn hàng ' +record.Name+ ' lỗi scan giao hàng vì trạng thái đơn hàng hiện tại không đúng.',
                                    // message: error.body.message,
                                    variant: 'error'
                                })
                            );
                        }
                        
                    })
                    .catch((error) => {
                        throw error;
                    });
                })
                .catch((error) => {
                    // Handle cancellation and unexpected errors here
                    console.error(error);

                    if (error.code == 'userDismissedScanner') {
                        // User clicked Cancel
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Scanning Cancelled',
                                message:
                                    'You cancelled the scanning session.',
                                mode: 'sticky'
                            })
                        );
                    }
                    else { 
                        // Inform the user we ran into something unexpected
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Barcode Scanner Error',
                                message:
                                    'There was a problem scanning the barcode: ' +
                                    error.message,
                                variant: 'error',
                                mode: 'sticky'
                            })
                        );
                    }
                })
                .finally(() => {
                    console.log('#finally');

                    // Clean up by ending capture,
                    // whether we completed successfully or had an error
                    this.myScanner.endCapture();
                });
        } else {
            // BarcodeScanner is not available
            // Not running on hardware with a camera, or some other context issue
            console.log(
                'Scan Barcode button should be disabled and unclickable.'
            );
            console.log('Somehow it got clicked: ');
            console.log(event);

            // Let user know they need to use a mobile phone with a camera
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Barcode Scanner Is Not Available',
                    message:
                        'Try again from the Salesforce app on a mobile device.',
                    variant: 'error'
                })
            );
        }
    }
}