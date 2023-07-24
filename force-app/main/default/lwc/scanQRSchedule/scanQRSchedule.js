import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import findRecord from '@salesforce/apex/scanQRScheduleController.findRecord';
import { updateRecord } from 'lightning/uiRecordApi';
import SCHEDULEID_FIELD from '@salesforce/schema/F_TMS_SO__c.Schedule_ID__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';
import STATUS_FIELD from '@salesforce/schema/F_TMS_SO__c.Status__c';
import findSchedule from '@salesforce/apex/scanQRScheduleController.findSchedule';
export default class scanQRChangeStatusSO extends LightningElement {
    myScanner;
    scanButtonDisabled = false;
    scannedBarcode = '';
    name = '';
    @api recordId;
    @api invoke() {
        console.log("Hi, I'm an action.");
    }

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
                    // this.scannedBarcode = 'Record has been updated status';

                    findRecord({ id: result.value})
                    .then((record) => {
                        


                        findSchedule({id: this.recordId})
                        
                        .then((scheduleRecord)=>{
                            const fields = {};
                            fields[ID_FIELD.fieldApiName] = result.value;
                            // fields[SCHEDULEID_FIELD.fieldApiName] = this.recordId;
                            
                            if(scheduleRecord.RecordType.Name === 'Lấy hàng'){
                                if(record.Status__c == 'Tạo mới'){
                                    fields[STATUS_FIELD.fieldApiName] = 'Tạo mới';
                                    fields[SCHEDULEID_FIELD.fieldApiName] = this.recordId;
                                }
    
                            }else if(scheduleRecord.RecordType.Name === 'Luân chuyển nội bộ' || scheduleRecord.RecordType.Name === 'Phát hàng' || scheduleRecord.RecordType.Name === 'Đơn vị vận chuyển ngoài'){
                                if(record.Status__c == 'Đã nhập kho'){
                                    fields[STATUS_FIELD.fieldApiName] = 'Đã nhập kho';
                                    fields[SCHEDULEID_FIELD.fieldApiName] = this.recordId;
                                }
                            }
                            const recordInput = { fields };
                            if(scheduleRecord.Finish_adding_order__c === false){
                                if(record.RecordType.Name === scheduleRecord.Order_Record_Type__c)   {
                                    if((record.Status__c == 'Tạo mới' && scheduleRecord.RecordType.Name === 'Lấy hàng') || (record.Status__c == 'Đã nhập kho' && (scheduleRecord.RecordType.Name === 'Luân chuyển nội bộ' || scheduleRecord.RecordType.Name === 'Phát hàng'))){
                                        updateRecord(recordInput)
                                        .then(() => {
                                            this.scannedBarcode = 'Đơn hàng ' + record.Name +' thêm vào thành công.';
                                            // this.scannedBarcode = result.value;
                                            // this.name = record.Name;
                                            this.dispatchEvent(
                                                new ShowToastEvent({
                                                    title: 'Scan thành công',
                                                    // message: 'Barcode scanned successfully.',
                                                    variant: 'success',
                                                })
                                            );
                                        })
                                        .catch(error => {
                                            this.dispatchEvent(
                                                new ShowToastEvent({
                                                    title: 'Error creating record',
                                                    // message: error.body.message,
                                                    variant: 'error'
                                                })
                                            );
                                        });
                                    }
                                    else{
                                        this.dispatchEvent(
                                            new ShowToastEvent({
                                                title: 'Đơn hàng ' + record.Name +' không thể thêm vào lệnh vì khác loại.',
                                                // message: 'Record type is not matched123',
                                                variant: 'error'
                                            })
                                        );
                                    }
                                    // this.dispatchEvent(
                                    //     new ShowToastEvent({
                                    //         title: 'Successful Scan',
                                    //         message: 'Barcode scanned successfully123.',
                                    //         variant: 'success'
                                    //     })
                                    // );
        
                                }else{
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Đơn hàng ' + record.Name +' không thể thêm vào lệnh vì khác Record Type.',
                                            // message: 'Record type is not matched123',
                                            variant: 'error'
                                        })
                                    );
                                    // this.scannedBarcode = 'Đơn hàng ' + record.Name +' không thể thêm vào.';
                                    
                                } 
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Không thể thêm đơn hàng vì lệnh đã được hoàn thành thêm hàng.',
                                        // message: 'Record type is not matched123',
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
                        throw error;
                    });
                    // this.dispatchEvent(
                    //     new ShowToastEvent({
                    //         title: 'Successful Scan',
                    //         message: 'Barcode scanned successfully.',
                    //         variant: 'success'
                    //     })
                    // );
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