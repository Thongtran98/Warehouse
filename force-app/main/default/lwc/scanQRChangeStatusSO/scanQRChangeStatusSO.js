import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import start_scan from './start_scan.html';
import scanQRChangeStatus from './scanQRChangeStatusSO.html';
import scanQRChangeStatusPackage from './scanQRChangeStatusPackage.html';
import findRecord from '@salesforce/apex/scanQRChangeStatusSOController.findRecord';
import findRecordPackage from '@salesforce/apex/scanQRChangeStatusSOController.findRecordPackage';
// import findRecordType from '@salesforce/apex/scanQRChangeStatusSOController.findRecordType';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/F_TMS_SO__c.Status__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';
import WAREHOUSER_FIELD from '@salesforce/schema/F_TMS_SO__c.Warehouse__c';
import WAREHOUSER_LOCATION from '@salesforce/schema/F_TMS_SO__c.Warehouse_Location__c';
import WAREHOUSER_KEEPER from '@salesforce/schema/F_TMS_SO__c.WarehouseKeeper__c';
import TRANSIT_OBJECT from "@salesforce/schema/In_transit_Item__c";

import ORDER from '@salesforce/schema/In_transit_Item__c.F_TMS_SO__c';
import NAME from '@salesforce/schema/In_transit_Item__c.Name';

import SHIPPER from '@salesforce/schema/In_transit_Item__c.ShipperContact__c';
import SCHEDULE from '@salesforce/schema/In_transit_Item__c.Schedule_ID__c';
import WARE from '@salesforce/schema/In_transit_Item__c.Warehouse_Departure__c';
import pickWarehouse from '@salesforce/apex/scanQRChangeStatusSOController.pickWarehouse';
// Package
import ID_PACK from '@salesforce/schema/Package__c.Id';
import STATUS_PACK from '@salesforce/schema/Package__c.PackageStatus__c';
import WAREHOUSE_PACK from '@salesforce/schema/Package__c.Warehouse__c';
import RACK_PACK from '@salesforce/schema/Package__c.StorageRack__c';
import LOCATION_PACK from '@salesforce/schema/Package__c.WarehouseLocation__c';
// Package Item
import PACKAGEITEM_OBJECT from "@salesforce/schema/StockOutPackage__c";
import NAME_PACKITEM from "@salesforce/schema/StockOutPackage__c.Name";
import PACKAGE_PACKITEM from "@salesforce/schema/StockOutPackage__c.Package__c";
import WAREHOUSE_PACKITEM from "@salesforce/schema/StockOutPackage__c.Warehouse__c";
import SCHEDULE_PACKITEM from "@salesforce/schema/StockOutPackage__c.ScheduleID__c";
import SHIPPER_PACKITEM from "@salesforce/schema/StockOutPackage__c.Shipper__c";

const FIELDS = ['F_TMS_SO__c.Schedule_Record_Type_Text__c'];

export default class scanQRChangeStatusSO extends LightningElement {
    @api recordId;
    screenNumber = "1";
    myScanner;
    scanButtonDisabled = false;
    scannedBarcode = '';
    name = '';
    recordType = '';
    
    @track value = 'none';
    @track detail;
    @track error;
    @track selectedLabel;
    warehouseShow = [];

    render() {
        // eslint-disable-next-line default-case
        switch (this.screenNumber) {
            case "1":
                return start_scan;
            case "2":
                return scanQRChangeStatusPackage;
            case "4":
                return scanQRChangeStatus;
        }
    }

    onScan(){
        this.screenNumber = "4";
    }
    onScanPackage(){
        this.screenNumber = "2";
    }
    clickBackMain(){
        this.screenNumber = "1";
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
                    console.log(result);
                    findRecord({ id: result.value})
                    .then((record) => {
                        pickWarehouse()
                        .then((warr)=>{
                            const fields = {};
                            fields[ID_FIELD.fieldApiName] = record.Id;
                            fields[STATUS_FIELD.fieldApiName] = 'Đã xuất hoàn toàn';
                            fields[WAREHOUSER_FIELD.fieldApiName] = null;
                            fields[WAREHOUSER_LOCATION.fieldApiName] = null;
                            // fields[WAREHOUSER_KEEPER.fieldApiName] = null;
                            const recordInput = { 
                                fields};

                            let fieldW = {};

                            fieldW[ORDER.fieldApiName] = record.Id;

                            if(record.Schedule_ID__c != null){
                                fieldW[SHIPPER.fieldApiName] = record.ShipperContact__c;
                                fieldW[SCHEDULE.fieldApiName] = record.Schedule_ID__c;
                                fieldW[WARE.fieldApiName] = warr.Id;
                                if(record.ShipperContact__c != null){
                                    fieldW[NAME.fieldApiName] = record.Name +' + '+record.ShipperContact__r.Name;
                                }else{
                                    fieldW[NAME.fieldApiName] = record.Name;
                                }
                            }
                            
                            let recordInputW = {
                                apiName:TRANSIT_OBJECT.objectApiName,
                                fields: fieldW
                            };
                            if(record.Status__c === 'Đang chờ xuất'){
                                createRecord(recordInputW)
                                .then((recordW) => {
                                    return new Promise((resolve, reject)=>{
                                        resolve();
                                    })
                                })
                                .then(()=>{
                                    updateRecord(recordInput)
                                    .then(() => {
                                    })
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Đơn hàng ' + record.M_v_n_n__c +' xuất kho thành công.',
                                            variant: 'success'
                                        })
                                    );
                                    // window.location.reload();
                                })
                                
                                .catch(error => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan không thành công.',
                                            variant: 'error'
                                        })
                                    );
                                }); 
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đơn hàng ' + record.M_v_n_n__c +' lỗi xuất kho vì trạng thái đơn hàng hiện tại không đúng',
                                        variant: 'error'
                                    })
                                );
                            }
                            })
                            
                        })
                    .catch((error) => {
                        throw error;
                    });
                })
                .catch((error) => {
                    console.error(error);

                    if (error.code == 'userDismissedScanner') {
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
            console.log(
                'Scan Barcode button should be disabled and unclickable.'
            );
            console.log('Somehow it got clicked: ');
            console.log(event);

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
                    console.log(result);
                    findRecordPackage({ id: result.value})
                    .then((records) => {
                        pickWarehouse()
                        .then((warr)=>{
                            const fields = {};
                            fields[ID_PACK.fieldApiName] = records.Id;
                            fields[STATUS_PACK.fieldApiName] = 'Đã xuất kho';
                            fields[WAREHOUSE_PACK.fieldApiName] = null;
                            fields[LOCATION_PACK.fieldApiName] = null;
                            fields[RACK_PACK.fieldApiName] = null;
                            
                            const recordInput = { 
                                fields};

                            let fieldW = {};

                            fieldW[PACKAGE_PACKITEM.fieldApiName] = records.Id;
                            fieldW[NAME_PACKITEM.fieldApiName] = records.Name;
                            fieldW[WAREHOUSE_PACKITEM.fieldApiName] = warr.Id;

    
                            if(records.Schedules__c != null){
                                fieldW[SCHEDULE_PACKITEM.fieldApiName] = records.Schedules__c;

                            }
                            
                            let recordInputW = {
                                apiName:PACKAGEITEM_OBJECT.objectApiName,
                                fields: fieldW
                            };
                            if(records.PackageStatus__c === 'Đang chờ xuất'){
                                createRecord(recordInputW)
                                .then((recordW) => {
                                    return new Promise((resolve, reject)=>{
                                        resolve();
                                    })
                                })
                                .then(()=>{
                                    updateRecord(recordInput)
                                    .then(() => {
                                    })
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Kiện hàng ' + records.MaVanDon__c +' xuất kho thành công.',
                                            variant: 'success'
                                        })
                                    );
                                    // window.location.reload();
                                })
                                
                                .catch(error => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Scan không thành công.',
                                            variant: 'error'
                                        })
                                    );
                                }); 
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Kiện hàng ' + records.MaVanDon__c +' lỗi xuất kho vì trạng thái kiện hàng hiện tại không đúng',
                                        variant: 'error'
                                    })
                                );
                            }
                            })
                            
                        })
                    .catch((error) => {
                        throw error;
                    });
                })
                .catch((error) => {
                    console.error(error);

                    if (error.code == 'userDismissedScanner') {
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
            console.log(
                'Scan Barcode button should be disabled and unclickable.'
            );
            console.log('Somehow it got clicked: ');
            console.log(event);

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