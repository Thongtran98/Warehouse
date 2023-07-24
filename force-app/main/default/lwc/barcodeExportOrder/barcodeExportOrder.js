
import { LightningElement, wire, track } from 'lwc';
import scannerPicker from './scanner-picker.html';
import barcodeListPage from './barcodeExportOrder.html';
import detailPage from './detail.html';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import findRecord from '@salesforce/apex/scanQRChangeStatusSOController.findRecord';
import findRecordList from '@salesforce/apex/scanQRChangeStatusSOController.findRecordList';
import findRecordPackage from '@salesforce/apex/scanQRChangeStatusSOController.findRecordPackage';
import findRecordListPackage from '@salesforce/apex/scanQRChangeStatusSOController.findRecordListPackage';
import findWarehouse from '@salesforce/apex/scanQRChangeStatusSOController.findWarehouse';
import findWarehouseLocation from '@salesforce/apex/scanQRChangeStatusSOController.findWarehouseLocation';
import findWarehouseLocationByNameAndWH from '@salesforce/apex/scanQRChangeStatusSOController.findWarehouseLocationByNameAndWH';
// F_TMS_SO__c
import WAREHOUSER_LOCATION from '@salesforce/schema/F_TMS_SO__c.Warehouse_Location__c';
import WAREHOUSER from '@salesforce/schema/F_TMS_SO__c.Warehouse__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';
import WAREHOUSER_KEEPER from '@salesforce/schema/F_TMS_SO__c.WarehouseKeeper__c';
import STATUS_FIELD from '@salesforce/schema/F_TMS_SO__c.Status__c';
// In_transit_Item
import TRANSIT_OBJECT from "@salesforce/schema/In_transit_Item__c";
import TRUCK from '@salesforce/schema/In_transit_Item__c.Truck_ID__c';
import ORDER from '@salesforce/schema/In_transit_Item__c.F_TMS_SO__c';
import NAME from '@salesforce/schema/In_transit_Item__c.Name';
import PARCEL from '@salesforce/schema/In_transit_Item__c.Parcel_Name__c';
import GROSS from '@salesforce/schema/In_transit_Item__c.Gross_weight_kg__c';
import CBM from '@salesforce/schema/In_transit_Item__c.Measurement_Total_CBM__c';
import SHIPPER from '@salesforce/schema/In_transit_Item__c.ShipperContact__c';
import SCHEDULE from '@salesforce/schema/In_transit_Item__c.Schedule_ID__c';
import PACKAGE from '@salesforce/schema/In_transit_Item__c.Number_of_Package__c';
import WARE from '@salesforce/schema/In_transit_Item__c.Warehouse_Departure__c';
// Package
import ID_PACK from '@salesforce/schema/Package__c.Id';
import STATUS_PACK from '@salesforce/schema/Package__c.PackageStatus__c';
import WAREHOUSE_PACK from '@salesforce/schema/Package__c.Warehouse__c';
import LOCATION_PACK from '@salesforce/schema/Package__c.WarehouseLocation__c';
// Package Item
import PACKAGEITEM_OBJECT from "@salesforce/schema/StockOutPackage__c";
import NAME_PACKITEM from "@salesforce/schema/StockOutPackage__c.Name";
import PACKAGE_PACKITEM from "@salesforce/schema/StockOutPackage__c.Package__c";
import WAREHOUSE_PACKITEM from "@salesforce/schema/StockOutPackage__c.Warehouse__c";
import SCHEDULE_PACKITEM from "@salesforce/schema/StockOutPackage__c.ScheduleID__c";
import SHIPPER_PACKITEM from "@salesforce/schema/StockOutPackage__c.Shipper__c";
import { CloseActionScreenEvent } from "lightning/actions";


export default class BarcodeExportOrder extends LightningElement {

    barcodeScanner;
    screenNumber = "1";
    selectedTab = "multi";

    showSettings = false;
    
    detailType;
    @track detail;
    @track error;
    @track selectedLabel;
    @track singleScanRecords = [];
    @track singleScanRecordsShow = [];
    @track multipleScanRecordsShow = [];
    @track multipleScanRecords = [];
    @track warehousePiclist = [];
    @track warehouseShow = [];
    value = 'WarehouseLocation';

    render() {
        // eslint-disable-next-line default-case
        switch (this.screenNumber) {
            case "1":
                return scannerPicker;
            case "2":
                return barcodeListPage;
            case "4":
                return detailPage;
        }
    }

    connectedCallback() {
        this.barcodeScanner = getBarcodeScanner();
    }
    handleChange(event) {
        this.selectedLabel = event.target.options.find(opt => opt.value === event.detail.value).label;
    }
    openSingleScan() {
        this.selectedTab = "single";
        if (this.barcodeScanner.isAvailable()) {
            this.barcodeScanner.beginCapture(
                { barcodeTypes: this.selectedBarcodeTypes() }
            )
            .then((barcode) => {
                
                findRecord({ id: barcode.value})
                .then(record => {
                    let last = this.last(this.singleScanRecords)
                    let count = 0;
                    if (last !== undefined) {
                        count = last.id;
                    }
                    count++;
                    let nameOrder = record.Name;
                    if(record.Status__c === 'Đang chờ xuất'){
                        this.singleScanRecords.push({
                            id: count,
                            name: nameOrder,
                            // description: "12345",
                            // quantity: 1,
                            barcode: barcode.value
                        });
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Scan thành công',
                                message: 'Đơn hàng được thêm vào danh sách.',
                                variant: 'success'
                            })
                        );
                    }else{
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Thêm đơn hàng vào danh sách thất bại vì status không thỏa điều kiện.',
                                // message: error.body.message,
                                variant: 'error'
                            })
                        );
                    }
                     
                })
                
                this.detail = Object.assign({}, this.singleScanRecords[this.singleScanRecords.length - 1]);
                this.detailType = "single";
                this.screenNumber = "2";
                
            })
            .catch(error => {
                this.error = error;
            })
            .finally(() => this.barcodeScanner.endCapture());
        }
    }

    openMultiScan() {
        this.selectedTab = "multi";
        if (this.barcodeScanner.isAvailable()) {
            this.barcodeScanner.beginCapture(
                { barcodeTypes: this.selectedBarcodeTypes() }
            )
            .then((barcode) => {
                
                findRecordPackage({ id: barcode.value})
                .then(record => {
                    let last = this.last(this.multipleScanRecords)
                    let count = 0;
                    if (last !== undefined) {
                        count = last.id;
                    }
                    count++;
                    let nameOrder = record.Name;
                    if(record.PackageStatus__c === 'Đang chờ xuất'){
                        this.multipleScanRecords.push({
                            id: count,
                            name: nameOrder,
                            barcode: barcode.value
                        });
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Scan thành công',
                                message: 'Package được thêm vào danh sách.',
                                variant: 'success'
                            })
                        );
                    }else{
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Scan không thành công',
                                message: 'Package không được thêm vào danh sách.',
                                variant: 'error'
                            })
                        ); 
                    }
                })
                
                this.detail = Object.assign({}, this.multipleScanRecords[this.multipleScanRecords.length - 1]);
                this.detailType = "multi";
                this.screenNumber = "2";
                
            })
            .catch(error => {
                this.error = error;
            })
            .finally(() => this.barcodeScanner.endCapture());
        }
    }

    viewDetail(event) {
        let id = event.detail.itemId;
        this.detailType = event.detail.scanType;
        let detail;
        if (this.detailType === "single") {
            detail = this.singleScanRecords.find(value => value.id  == id);
        } else if (this.detailType === "multi") {
            detail = this.multipleScanRecords.find(value => value.id  == id);
        }
        this.detail = Object.assign({}, detail);
        this.screenNumber = "4";
    }

    deleteDetail(event) {
        let id = event.detail.itemId;
        if (event.detail.scanType === "single") {
            let index = this.singleScanRecords.findIndex(item => item.id == id);
            if (index > -1) {
                this.singleScanRecords.splice(index, 1);
            }
        } else if (event.detail.scanType === "multi") {
            let index = this.multipleScanRecords.findIndex(item => item.id == id);
            if (index > -1) {
                this.multipleScanRecords.splice(index, 1);
            }
        }
    }

    backButtonPressed() {
        this.screenNumber = "2";
    }

    savePressed() {
        if (this.detailType === "single") {
            let index = this.singleScanRecords.findIndex(x => x.id == this.detail.id);
            this.singleScanRecords[index] = this.detail;
            this.singleScanRecords.map(barcodeResult => {
                this.singleScanRecordsShow.push(barcodeResult.barcode);    
            });
            
            findRecordList({
                ids: this.singleScanRecordsShow
            })
            .then((records)=>{
                for(let index = 0; index < records.length; index++){
                    let fieldP = {};
                    fieldP[ID_FIELD.fieldApiName] = records[index].Id;
                    fieldP[STATUS_FIELD.fieldApiName] = 'Đã xuất hoàn toàn';
                    fieldP[WAREHOUSER.fieldApiName] = null;
                    fieldP[WAREHOUSER_LOCATION.fieldApiName] = null;
                    fieldP[WAREHOUSER_KEEPER.fieldApiName] = null;

                    let fieldW = {};
                        // if(records[index].Truck__c != null){
                        //     fieldW[TRUCK.fieldApiName] = records[index].Truck__c;
                        // }
                        
                        fieldW[ORDER.fieldApiName] = records[index].Id;
                        // fieldW[PARCEL.fieldApiName] = records[index].Parcel_name__c;
                        // fieldW[PACKAGE.fieldApiName] = records[index].Number_of_package__c;

                        // fieldW[CBM.fieldApiName] = records[index].Measurement_Total_CBM__c;
                        // fieldW[GROSS.fieldApiName] = records[index].Gross_Weight__c;
                        // fieldW[PARCEL.fieldApiName] = record.Parcel_name__c;

                        if(records[index].Schedule_ID__c != null){
                            fieldW[SHIPPER.fieldApiName] = records[index].ShipperContact__c;
                            fieldW[SCHEDULE.fieldApiName] = records[index].Schedule_ID__c;
                            fieldW[WARE.fieldApiName] = records[index].Schedule_ID__r.Destination_Warehouse__c;
                            if(records[index].ShipperContact__c != null){
                                fieldW[NAME.fieldApiName] = records[index].Name +' + '+records[index].ShipperContact__r.Name;
                            }else{
                                fieldW[NAME.fieldApiName] = records[index].Name;
                            }
                        }
                       
                        let recordInputW = {
                            apiName:TRANSIT_OBJECT.objectApiName,
                            fields: fieldW
                            // fieldW
                        };

                        let recordInputP = {
                            fields: fieldP
                        
                        };
                        createRecord(recordInputW)
                        .then((recordW) => {
                            return new Promise((resolve, reject)=>{
                                // this.scannedBarcode = 'Đơn hàng '+records.Name+' xuất kho thành công';
                                // alert('success1');
                                resolve();
                            })
                        })
                        .then(()=>{
                            updateRecord(recordInputP)
                            .then(() => {
                                // alert('success');
                            })
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Đã xuất thành công.',
                                    // message: error.body.message,
                                    variant: 'success'
                                })
                            );
                            window.location.reload();
                        })
                        
                        .catch(error => {
                            // alert('failed1');
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Scan không thành công.',
                                    // message: error.body.message,
                                    variant: 'error'
                                })
                            );
                        });
                        // if(records[index].Status__c === 'Đang chờ xuất'){
                        //     createRecord(recordInputW)
                        //     .then((recordW) => {
                        //         this.scannedBarcode = 'Đơn hàng '+records.Name+' nhập kho thành công';
                        //         alert('success1');
                        //     })
                        //     .catch(error => {
                        //         alert('failed1');
                        //     });
                        //     updateRecord(recordInputP)
                        //     .then(() => {
                        //         alert('success');
                        //     })
                        //     .catch(error => {
                        //         alert('failed');
                        //     });
                        // }else{
                        //     alert('Đơn hàng '+ records[index].Name +' không được xuất vì không đúng trạng thái.');
                        // }
                       //if(records.Status__c === 'Đã lấy' || records.Status__c === 'Đã xuất kho'){
                            
                }
            })
            .catch(error => {
                alert('Scan không thành công.')
            })
        }else if(this.detailType === "multi"){
            let index = this.multipleScanRecords.findIndex(x => x.id == this.detail.id);
            this.multipleScanRecords[index] = this.detail;
            this.multipleScanRecords.map(barcodeResult => {
                this.multipleScanRecordsShow.push(barcodeResult.barcode);    
            });
            
            findRecordListPackage({
                ids: this.multipleScanRecordsShow
            })
            .then((records)=>{
                for(let index = 0; index < records.length; index++){
                    let fieldP = {};
                    fieldP[ID_PACK.fieldApiName] = records[index].Id;
                    fieldP[STATUS_PACK.fieldApiName] = 'Đã xuất kho';
                    fieldP[WAREHOUSE_PACK.fieldApiName] = null;
                    fieldP[LOCATION_PACK.fieldApiName] = null;
                    // fieldP[WAREHOUSER_KEEPER.fieldApiName] = null;

                    let fieldW = {};
                        fieldW[PACKAGE_PACKITEM.fieldApiName] = records[index].Id;
                        fieldW[NAME_PACKITEM.fieldApiName] = records[index].Name;
                        if(records[index].Warehouse__c != null){
                            fieldW[WAREHOUSE_PACKITEM.fieldApiName] = records[index].Schedules__r.Destination_Warehouse__c;
                        }

                        if(records[index].Schedules__c != null){
                            fieldW[SCHEDULE_PACKITEM.fieldApiName] = records[index].Schedules__c;
                        }
                        
                        let recordInputW = {
                            apiName:PACKAGEITEM_OBJECT.objectApiName,
                            fields: fieldW
                        };

                        let recordInputP = {
                            fields: fieldP
                        
                        };
                        createRecord(recordInputW)
                        .then((recordW) => {
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
                                    title: 'Đã xuất Package thành công.',
                                    variant: 'success'
                                })
                            );
                            window.location.reload();
                        })
                        
                        .catch(error => {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Scan Package không thành công.',
                                    variant: 'error'
                                })
                            );
                        });          
                }
            })
            .catch(error => {
                alert('Scan không thành công.')
            })
        }
    }
    
    
    textInputChange(event) {
        let field = event.target.name;
        this.detail[field] = event.target.value;
    }

    settingsButtonPressed() {
        this.showSettings = true;
    }
    
    settingsBackPressed() {
        this.showSettings = false;
    }
    
    settingToggled(event) {
        let index = this.settings.findIndex((x) => x.type == event.detail.type);
        let item = Object.assign({}, this.settings[index]);
        item.checked = event.detail.checked;
        this.settings[index] = item;
    }

    last(array) {
        if (array.length > 0)
            return array[array.length - 1];

        return undefined;
    }

    selectedBarcodeTypes() {
        return this.settings
        .filter((item) => item.checked)
        .map((item) => item.type);
    }
    get scannedBarcodesAsString() {
        return this.singleScanRecords.map(barcodeResult => {

            return barcodeResult.name;
        });
        
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