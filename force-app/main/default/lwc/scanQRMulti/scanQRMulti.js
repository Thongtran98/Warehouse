import { LightningElement, wire, track } from 'lwc';
import start_scan from './start_scan.html';
import pick_rack_package from './pick_rack_package.html';
import pick_rack from './pick_rack.html';
import scanMultiPackage from './scanQRMultiPackage.html';
import scanMulti from './scanQRMulti.html';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import findRecord from '@salesforce/apex/scanBarcodeAddRack.findRecord';
import findPackage from '@salesforce/apex/scanBarcodeAddRack.findPackage';
import findRecordPackage from '@salesforce/apex/scanBarcodeAddRack.findRecordPackage';
import findWarehouse from '@salesforce/apex/scanBarcodeAddRack.findWarehouse';
import findWarehouseLocation from '@salesforce/apex/scanBarcodeAddRack.findWarehouseLocation';
import findStorageRack from '@salesforce/apex/scanBarcodeAddRack.findStorageRack';
import findWarehouseLocationByNameAndWH from '@salesforce/apex/scanBarcodeAddRack.findWarehouseLocationByNameAndWH';
import RACK from '@salesforce/schema/F_TMS_SO__c.StorageRack__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';
// Inventory_Item
import INENTORY_OBJECT from "@salesforce/schema/Inventory_Item__c";
import NAME from '@salesforce/schema/Inventory_Item__c.Name';   
import ORDER from '@salesforce/schema/Inventory_Item__c.F_TMS_SO__c';
import WARE from '@salesforce/schema/Inventory_Item__c.Warehouse_Destination__c';
import STORAGE from '@salesforce/schema/Inventory_Item__c.StorageRack__c';
import SCHE from '@salesforce/schema/Inventory_Item__c.Schedule_ID__c';
import SCHE_TYPE from '@salesforce/schema/Inventory_Item__c.Schedule_Record_Type__c';
import WAREHOUSER_LOCATION from '@salesforce/schema/Inventory_Item__c.Warehouse_Location__c';
import { CloseActionScreenEvent } from "lightning/actions";
// Package
import RACK_PACK from '@salesforce/schema/Package__c.StorageRack__c';
import ID_PACK from '@salesforce/schema/Package__c.Id';
// Package Item
import PACKAGEITEM_OBJECT from "@salesforce/schema/Stock_In_Package__c";
import WAREHOUSE_PACKITEM from '@salesforce/schema/Stock_In_Package__c.Warehouse__c';
import PACKAGE_PACKITEM from '@salesforce/schema/Stock_In_Package__c.Package__c';
import LOCATION_PACKITEM from '@salesforce/schema/Stock_In_Package__c.WarehouseLocation__c';
import RACK_PACKITEM from '@salesforce/schema/Stock_In_Package__c.StorageRack__c';
import SCHEDULE_PACKITEM from '@salesforce/schema/Stock_In_Package__c.ScheduleID__c';
import NAME_PACKITEM from '@salesforce/schema/Stock_In_Package__c.Name';
//test ở đây
export default class ScanQRMulti extends LightningElement {
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
    @track rackLabel;
    @track LocationRack;
    @track LocationRackPackage;
    @track rackLabelPackage;
    warehouseShow = [];
    warehouseShowPackage = [];

    render() {
        // eslint-disable-next-line default-case
        switch (this.screenNumber) {
            case "1":
                return start_scan;
            case "2":
                return pick_rack;
            case "3":
                return pick_rack_package;
            case "4":
                return scanMulti;
            case "5":
                return scanMultiPackage;
    }
}
    
    onScan(event){
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
                    findStorageRack({rackId: result.value})
                    .then((recordRack)=>{
                        this.rackLabel = recordRack.Id;
                        this.LocationRack = recordRack.WarehouseLocation__c;
                    })
                    
                })
                .catch((error) => {
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
                    this.myScanner.endCapture();
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Barcode Scanner Is Not Available',
                    message:
                        'Try again from the Salesforce app on a mobile device.',
                    variant: 'error'
                })
            );
        }
        
        this.screenNumber = "4";
    }
    onScanPackage(){
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
                    findStorageRack({rackId: result.value})
                    .then((recordRackPack)=>{
                        this.rackLabelPackage = recordRackPack.Id;
                        this.LocationRackPackage = recordRackPack.WarehouseLocation__c;
                    })
                })
                .catch((error) => {
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
                    this.myScanner.endCapture();
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Barcode Scanner Is Not Available',
                    message:
                        'Try again from the Salesforce app on a mobile device.',
                    variant: 'error'
                })
            );
        }
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
                            let fieldW = {};
                            if(record.Schedule_ID__c != null){
                                fieldW[WARE.fieldApiName] = record.Warehouse__c;
                                
                            }
                            fieldW[SCHE.fieldApiName] = record.Schedule_ID__c;
                            fieldW[WAREHOUSER_LOCATION.fieldApiName] = record.Warehouse_Location__c;
                            fieldW[STORAGE.fieldApiName] = this.rackLabel;
                            if(record.Id != null){
                                fieldW[ORDER.fieldApiName] = record.Id;
                            }

                            if(record.Warehouse__c != null){
                                fieldW[NAME.fieldApiName] = record.Name +' + '+record.Warehouse__r.Name;
                              
                            }else{
                                fieldW[NAME.fieldApiName] = record.Name;
                            }

                            let recordInputW = {
                                apiName:INENTORY_OBJECT.objectApiName,
                                fields: fieldW
                              
                            };

                            let fieldP = {};
                            fieldP[ID_FIELD.fieldApiName] = record.Id;
                            fieldP[RACK.fieldApiName] = this.rackLabel;
    
                            let recordInputP = { 
                                fields : fieldP
                            };
     
                            if(record.Warehouse_Location__c == this.LocationRack){
                                createRecord(recordInputW)
                                .then(() => {
                                    return new Promise((resolve, reject)=>{
                                
                                        resolve();
                                    })
                                })
                                .then(()=>{
                                updateRecord(recordInputP)
                                .then(() => {
                                 
                                })
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đã nhập kệ thành công.',
                                        variant: 'success'
                                    })
                                );
                                // window.location.reload();
                                })
                                .catch(error => {
                                
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan package không thành công.',
                                            message: error.body.message,
                                            variant: 'error'
                                        })
                                    );
                                });
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đơn hàng ' + record.M_v_n_n__c +' lỗi nhập vì kệ hàng không thuộc Warehouse Location',
                                        variant: 'error'
                                    })
                                );
                            }
                        // })
                        // .catch(()=>{
                        //     this.dispatchEvent(
                        //         new ShowToastEvent({
                        //             title: 'lỗi nhập kho',
                        //             variant: 'error'
                        //         })
                        //     );
                        // })
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
                    // alert(this.rackLabel);
                    findRecordPackage({ id: result.value})
                    .then((record) => {
                        // pickWarehouse()
                        // .then((warr)=>{
                            let fieldWW = {};
                            if(record.Schedules__c != null){
                                fieldWW[WAREHOUSE_PACKITEM.fieldApiName] = record.Warehouse__c;
                                
                            }
                            fieldWW[PACKAGE_PACKITEM.fieldApiName] = record.Id;
                            if(record.Warehouse__c != null){
                                fieldWW[NAME_PACKITEM.fieldApiName] = record.Name +' + '+record.Warehouse__r.Name;
                                
                            }else{
                                fieldWW[NAME_PACKITEM.fieldApiName] = record.Name;
                            }

                            if(record.Schedules__c != null){
                                fieldWW[SCHEDULE_PACKITEM.fieldApiName] = record.Schedules__c;
                                
                            }
                            fieldWW[RACK_PACKITEM.fieldApiName] = this.rackLabelPackage;

                            let recordInputWW = {
                                apiName:PACKAGEITEM_OBJECT.objectApiName,
                                fields: fieldWW
                                
                            };

                            let fieldP = {};
                            fieldP[ID_PACK.fieldApiName] = record.Id;
                            fieldP[RACK_PACK.fieldApiName] = this.rackLabelPackage;
    
                            let recordInputP = { 
                                fields : fieldP
                            };
                            if(record.WarehouseLocation__c == this.LocationRackPackage){
                                createRecord(recordInputWW)
                                .then(() => {
                                    return new Promise((resolve, reject)=>{
                                
                                        resolve();
                                    })
                                })
                                .then(()=>{
                                updateRecord(recordInputP)
                                .then(() => {
                                 
                                })
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đã nhập kệ thành công.',
                                        variant: 'success'
                                    })
                                );
                                // window.location.reload();
                                })
                                .catch(error => {
                                
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan package không thành công.',
                                            message: error.body.message,
                                            variant: 'error'
                                        })
                                    );
                                });
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đơn hàng ' + record.MaVanDon__c +' lỗi nhập vì kệ hàng không thuộc Warehouse Location',
                                        variant: 'error'
                                    })
                                );
                            }
                        // })
                        // .catch(()=>{
                        //     this.dispatchEvent(
                        //         new ShowToastEvent({
                        //             title: 'lỗi nhập kho',
                        //             variant: 'error'
                        //         })
                        //     );
                        // })
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