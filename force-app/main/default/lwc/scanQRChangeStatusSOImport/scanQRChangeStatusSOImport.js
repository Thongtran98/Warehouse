import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import pick_location from './pick_location.html';
import pick_location_package from './pick_location_package.html';
import start_scan from './start_scan.html';
import QRChangeStatusSOImport from './scanQRChangeStatusSOImport.html';
import QRChangeStatusSOImportPackage from './scanQRChangeStatusSOImportPackage.html';
import findRecord from '@salesforce/apex/scanQRChangeStatusSOController.findRecord';
import findRecordPackage from '@salesforce/apex/scanQRChangeStatusSOController.findRecordPackage';
import pickLocation from '@salesforce/apex/scanQRChangeStatusSOController.pickLocation';
import pickWarehouse from '@salesforce/apex/scanQRChangeStatusSOController.pickWarehouse';
import { updateRecord } from 'lightning/uiRecordApi';
// Đơn hàng
import STATUS_FIELD from '@salesforce/schema/F_TMS_SO__c.Status__c';
import WAREHOUSER_FIELD from '@salesforce/schema/F_TMS_SO__c.Warehouse__c';
import LOCATION from '@salesforce/schema/F_TMS_SO__c.Warehouse_Location__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';
// Package
import ID_PACK from '@salesforce/schema/Package__c.Id';
import STATUS_PACK from '@salesforce/schema/Package__c.PackageStatus__c';
import WAREHOUSE_PACK from '@salesforce/schema/Package__c.Warehouse__c';
import LOCATION_PACK from '@salesforce/schema/Package__c.WarehouseLocation__c';

export default class scanQRChangeStatusSOImport extends LightningElement {
    myScanner;
    screenNumber = "1";
    scanButtonDisabled = false;
    scannedBarcode = '';
    name = '';
    ware = '';
    parcel = '';

    @track value = 'none';
    @track detail;
    @track error;
    @track selectedLabel;
    @track selectedLabelPackage;
    warehouseShow = [];
    warehouseShowPackage = [];

    render() {
        // eslint-disable-next-line default-case
        switch (this.screenNumber) {
            case "1":
                return start_scan;
            case "2":
                return pick_location;
            case "3":
                return pick_location_package;
            case "4":
                return QRChangeStatusSOImport;
            case "5":
                return QRChangeStatusSOImportPackage;
        }
    }
    
    onScan(){
        pickLocation()
        .then((recordLocation)=>{
            
            let lstWarehouse = [{label: '--None--', value: 'none' }];
            for (let index = 0; index < recordLocation.length; index++) {
                lstWarehouse.push({label: recordLocation[index].Name, value: recordLocation[index].Id});
                // alert(recordLocation[index].Name);
            }
            this.warehouseShow = lstWarehouse;
        })
        
        this.screenNumber = "2";
    }
    onScanPackage(){
        pickLocation()
        .then((recordLocation)=>{
            
            let lstWarehouse = [{label: '--None--', value: 'none' }];
            for (let index = 0; index < recordLocation.length; index++) {
                lstWarehouse.push({label: recordLocation[index].Name, value: recordLocation[index].Id});
                // alert(recordLocation[index].Name);
            }
            this.warehouseShowPackage = lstWarehouse;
        })
        
        this.screenNumber = "3";
    }
    handleChange(event) {
        this.selectedLabel = event.target.options.find(opt => opt.value === event.target.value).value;
    }
    handleChangePackage(event) {
        this.selectedLabelPackage = event.target.options.find(opt => opt.value === event.target.value).value;
    }
    clickChange(){

        this.screenNumber = "4";
    }
    clickChangePackage(){

        this.screenNumber = "5";
    }
    connectedCallback() {
        this.myScanner = getBarcodeScanner();
        if (this.myScanner == null || !this.myScanner.isAvailable()) {
            this.scanButtonDisabled = true;
        }
    }
    selectedBarcodeTypes() {
        return this.settings
        .filter((item) => item.checked)
        .map((item) => item.type);
    }

    handleBeginScanClick(event) {
        this.scannedBarcode = '';
        this.name = '';

        if (this.myScanner != null && this.myScanner.isAvailable()) {
            const scanningOptions = {
                barcodeTypes: this.selectedBarcodeTypes(),
                instructionText: 'Scan a QR Code',
                successText: 'Scanning complete.'
            };
            this.myScanner
                .beginCapture(scanningOptions)
                .then((result) => {
                    findRecord({ id: result.value})
                    .then((record) => {
                        pickWarehouse()
                        .then((warr)=>{

                            let fieldP = {};
                            fieldP[ID_FIELD.fieldApiName] = record.Id;
                            fieldP[STATUS_FIELD.fieldApiName] = 'Đã nhập hoàn toàn';
                            fieldP[WAREHOUSER_FIELD.fieldApiName] = warr.Id;
                            fieldP[LOCATION.fieldApiName] = this.selectedLabel;
    
                            let recordInputP = { 
                                fields : fieldP
                            };
     
                            if(record.Status__c === 'Đã lấy' || record.Status__c === 'Đã xuất hoàn toàn'){
                                updateRecord(recordInputP)
                                .then(() => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan thành công',
                                            message: 'Đơn hàng ' + record.Name +' nhập kho thành công ',
                                            variant: 'success'
                                        })
                                    );
                                })
                                .catch(error => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan chuyển trạng thái không thành công',
                                            variant: 'error'
                                        })
                                    );
                                });
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đơn hàng ' + record.M_v_n_n__c +' lỗi nhập kho vì trạng thái đơn hàng hiện tại không đúng ',
                                        variant: 'error'
                                    })
                                );
                            }
                        })
                        .catch(()=>{
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'lỗi nhập kho',
                                    variant: 'error'
                                })
                            );
                        })
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
    // FOR PACKAGE
    handleBeginScanClickPackage(event) {
        this.scannedBarcode = '';
        this.name = '';

        if (this.myScanner != null && this.myScanner.isAvailable()) {
            const scanningOptions = {
                barcodeTypes: this.selectedBarcodeTypes(),
                instructionText: 'Scan a QR Code',
                successText: 'Scanning complete.'
            };
            this.myScanner
                .beginCapture(scanningOptions)
                .then((result) => {
                    findRecordPackage({ id: result.value})
                    .then((record) => {
                        pickWarehouse()
                        .then((warr)=>{

                            let fieldP = {};
                            fieldP[ID_PACK.fieldApiName] = record.Id;
                            fieldP[STATUS_PACK.fieldApiName] = 'Đã nhập kho';
                            fieldP[WAREHOUSE_PACK.fieldApiName] = warr.Id;
                            fieldP[LOCATION_PACK.fieldApiName] = this.selectedLabelPackage;
    
                            let recordInputP = { 
                                fields : fieldP
                            };
                            
                            if(record.PackageStatus__c === 'Đã lấy' || record.PackageStatus__c === 'Đang xuất kho'){
                                updateRecord(recordInputP)
                                .then(() => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan thành công',
                                            message: 'Kiện hàng ' + record.MaVanDon__c +' nhập kho thành công ',
                                            variant: 'success'
                                        })
                                    );
                                })
                                .catch(error => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan chuyển trạng thái không thành công',
                                            variant: 'error'
                                        })
                                    );
                                });
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Kiện hàng ' + record.MaVanDon__c +' lỗi nhập kho vì trạng thái kiện hàng hiện tại không đúng ',
                                        variant: 'error'
                                    })
                                );
                            }
                        })
                        .catch(()=>{
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'lỗi nhập kho',
                                    variant: 'error'
                                })
                            );
                        })
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
    settings = [
        {
            name: "QR Code",
            type: "qr",
            // image: `${resources}/barcodeScannerResource/qr.jpg`,
            description: "QR-Code (Quick Response) is a 2D barcode type commonly used with mobile and smart-phone devices to direct users to additional information about a particular topic or product.",
            checked: true
        },
        {
            name: "Code 128",
            type: "code128",
            // image: `${resources}/barcodeScannerResource/code128.jpg`,
            description: "Code 128 consists of alphanumeric or numeric-only barcodes and is used extensively worldwide in shipping and packaging industries as a product identification code.",
            checked: true
        },
        {
            name: "Code 39",
            type: "code39",
            // image: `${resources}/barcodeScannerResource/code39.jpg`,
            description: "Code 39 consists of barcode symbols representing numbers 0-9, upper-case letters A-Z, the space character and the following symbols: – . $ / + %. and is used for various labels such as name badges, inventory and industrial applications.",
            checked: true
        },
        {
            name: "Code 93",
            type: "code93",
            // image: `${resources}/barcodeScannerResource/code93.jpg`,
            description: "The Code 93 barcode is an updated, more secure and compact version of the Code 39 barcode. It is used in the military, logistics and automotive fields to encode special delivery information.",
            checked: true
        },
        {
            name: "Data Matrix",
            type: "datamatrix",
            // image: `${resources}/barcodeScannerResource/datamatrix.jpg`,
            description: "A Data Matrix Code is a 2D code that consists of black and white modules, usually arranged in a square pattern. Data Matrix symbols are often used for unique item identification.",
            checked: true
        },
        {
            name: "EAN-13",
            type: "ean13",
            // image: `${resources}/barcodeScannerResource/ean13.jpg`,
            description: "EAN-13 & GTIN-13 are UPC codes that have 13 characters used to encode Global Trade Item Numbers (GTIN), which uniquely identify a product for retail checkout or tracking purposes.",
            checked: true
        },
        {
            name: "EAN-8",
            type: "ean8",
            // image: `${resources}/barcodeScannerResource/ean8.jpg`,
            description: "EAN-8 & GTIN-8 are UPC codes that have 8 characters used to encode Global Trade Item Numbers (GTIN), which uniquely identify a product for retail checkout or tracking purposes.",
            checked: true
        },
        {
            name: "ITF",
            type: "itf",
            // image: `${resources}/barcodeScannerResource/itf.jpg`,
            description: "Interleaved 2 of 5 (ITF) is a numeric only barcode used to encode pairs of numbers into a self-checking, high-density barcode format. ITF is often used in the shipping and warehouse industries.",
            checked: true
        },
        {
            name: "UPC-E",
            type: "upce",
            // image: `${resources}/barcodeScannerResource/upce.jpg`,
            description: "UPC-E is a variation of UPC-A generally used on products with very small packaging where a full UPC-A barcode couldn't reasonably fit. UPC-E is often used in grocery stores and other retail establishments across the United States.",
            checked: true
        },
        {
            name: "PDF 417",
            type: "pdf417",
            // image: `${resources}/barcodeScannerResource/pdf417.jpg`,
            description: "PDF417 is a stacked linear barcode format used in a variety of applications such as transport, identification cards, and inventory management. \"PDF\" stands for Portable Data File.",
            checked: true
        }
    ];
}