import { LightningElement, wire, track } from 'lwc';
import scannerPicker from './scanner-picker.html';
import barcodeListPage from './barcodeAddRack.html';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import detailPage from './detail.html';
import { RefreshEvent } from 'lightning/refresh';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import findRecord from '@salesforce/apex/scanBarcodeAddRack.findRecord';
import findRecordList from '@salesforce/apex/scanBarcodeAddRack.findRecordList';
import findRecordPackage from '@salesforce/apex/scanBarcodeAddRack.findRecordPackage';
import findRecordListPackage from '@salesforce/apex/scanBarcodeAddRack.findRecordListPackage';
import findWarehouse from '@salesforce/apex/scanBarcodeAddRack.findWarehouse';
import findWarehouseLocation from '@salesforce/apex/scanBarcodeAddRack.findWarehouseLocation';
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
// import resources from '@salesforce/resourceUrl/barcodeScanner';

export default class BarcodeAddRack extends LightningElement {

    // splashLogo = `${resources}/barcodeScannerResource/splashScreen.svg`;

    barcodeScanner;
    screenNumber = "1";
    selectedTab = "multi";

    showSettings = false;
    
    detailType;
    @track value = 'none';
    @track detail;
    @track error;
    @track selectedLabel;

    @track singleScanRecords = [];
    @track singleScanRecordsShow = [];
    @track multipleScanRecordsShow = [];
    @track multipleScanRecords = [];
    @track warehousePiclist = [];
    warehouseShow = [];
    
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
                    // if(record.Status__c === 'Đã lấy' || record.Status__c === 'Đã xuất kho'){
                        this.singleScanRecords.push({
                            id: count,
                            name: nameOrder,
                            barcode: barcode.value
                        });
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Scan thành công',
                                message: 'Đơn hàng được thêm vào danh sách.',
                                variant: 'success'
                            })
                        );
                    // }else{
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Thêm đơn hàng vào danh sách thất bại vì status không thỏa điều kiện.',
                               
                    //             variant: 'error'
                    //         })
                    //     );
                    // }
                    
                    findWarehouseLocation({warehouse: record.Warehouse_Location__c})
                    .then((recordLocation) =>{
                        
                        let lstWarehouse = [{label: '--None--', value: 'none' }];
                        // lstWarehouse.push( )
                        for (let index = 0; index < recordLocation.length; index++) {
                            lstWarehouse.push({label: recordLocation[index].Name, value: recordLocation[index].Id});
                            // alert(recordLocation[index].Id);
                        }
                        this.warehouseShow = lstWarehouse;     
                    })
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
    handleChange(event) {
        this.selectedLabel = event.target.options.find(opt => opt.value === event.target.value).value;
        this.selectedLabelName = event.target.options.find(opt => opt.value === event.target.value).label;
    }
    handleChangePackage(event) {
        this.selectedLabelPackage = event.target.options.find(opt => opt.value === event.target.value).value;
        this.selectedLabelNamePackage = event.target.options.find(opt => opt.value === event.target.value).label;
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
                    // if(record.PackageStatus__c === 'Đã lấy' || record.PackageStatus__c === 'Đã xuất kho'){
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
                    // }else{
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Scan thành công',
                    //             message: 'Package không được thêm vào danh sách.',
                    //             variant: 'error'
                    //         })
                    //     ); 
                    // }
                    findWarehouseLocation({warehouse: record.WarehouseLocation__c})
                    .then((recordLocation) =>{
                        
                        let lstWarehouse = [{label: '--None--', value: 'none' }];
                        // lstWarehouse.push( )
                        for (let index = 0; index < recordLocation.length; index++) {
                            lstWarehouse.push({label: recordLocation[index].Name, value: recordLocation[index].Id});
                            // alert(recordLocation[index].Id);
                        }
                        this.warehouseShow = lstWarehouse;     
                    })
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

    continueMultiScan() {
        if (this.barcodeScanner.isAvailable()) {
            setTimeout(() => {
                this.barcodeScanner.resumeCapture()
                .then((barcode) => this.addMultiScannedBarcode(barcode))
                .catch((error) => {
                    this.error = error;
                    this.barcodeScanner.endCapture();
                })
                .finally(() => this.continueMultiScan());
            }, 1000);
        }
    }

    addMultiScannedBarcode(barcode) {
        
        findRecord({ id: barcode.value})
                .then(record => {
                    let last = this.last(this.multipleScanRecords)
                    let count = 0;
                    if (last !== undefined) {
                        count = last.id;
                    }
                    count++;
                    let nameOrder = record.Name;
                    this.multipleScanRecords.push({
                        id: count,
                        name: nameOrder,
                        // description: "12345",
                        // quantity: 1,
                        // barcode: barcode.value
                    });
                    this.detail = Object.assign({}, this.multipleScanRecords[this.multipleScanRecords.length - 1]);
                    this.detailType = "multi";
                    this.screenNumber = "2";
                })
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
            if(this.selectedLabel === 'none' || this.selectedLabel === 'undefined' || this.selectedLabel === undefined){
                alert('Bạn chưa nhập vị trí trong kệ.');
            }else{
            
                let index = this.singleScanRecords.findIndex(x => x.id == this.detail.id);
                this.singleScanRecords[index] = this.detail;
                this.singleScanRecords.map(barcodeResult => {
                    this.singleScanRecordsShow.push(barcodeResult.barcode);    
                });
                
                findRecordList({
                    ids: this.singleScanRecordsShow
                })
                .then((records)=>{
                    
                    let testlabel = this.selectedLabel;
                    for(let index = 0; index < records.length; index++){
                            let fieldW = {};
                            if(records[index].Schedule_ID__c != null){
                                fieldW[WARE.fieldApiName] = records[index].Schedule_ID__r.Destination_Warehouse__c;
                                
                            }
                            fieldW[SCHE.fieldApiName] = records[index].Schedule_ID__c;
                            // fieldW[SCHE_TYPE.fieldApiName] = records[index].Schedule_Record_Type__c;
                            // alert(fieldW[SCHE.fieldApiName]);
                            // alert(records[index].Schedule_ID__c);

                            fieldW[WAREHOUSER_LOCATION.fieldApiName] = records[index].Warehouse_Location__c;
                            fieldW[STORAGE.fieldApiName] = testlabel;
                            if(records[index].Id != null){
                                fieldW[ORDER.fieldApiName] = records[index].Id;
                                
                            }

                            if(records[index].Destination_Warehouse__c != null){
                                fieldW[NAME.fieldApiName] = records[index].Name +' + '+records[index].Destination_Warehouse__c;
                              
                            }else{
                                fieldW[NAME.fieldApiName] = records[index].Name;
                            }

                            // if(records[index].Schedule_ID__c != null){
                            //     fieldW[SCHEDULE.fieldApiName] = records[index].Schedule_ID__c;
                            // }
                           
                            
                           
                            let recordInputW = {
                                apiName:INENTORY_OBJECT.objectApiName,
                                fields: fieldW
                              
                            };

                            let fieldP = {};
                            fieldP[ID_FIELD.fieldApiName] = records[index].Id;
                            
                            fieldP[RACK.fieldApiName] = this.selectedLabel;

                            let recordInputP = {
                                fields: fieldP
                            
                            };
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
                            window.location.reload();
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
                    
                    }

                })
                .catch(error => {
                    alert('Scan không thành công.')
                })
            }
        }else if(this.detailType === "multi"){
            if(this.selectedLabelPackage === 'none' || this.selectedLabelPackage === 'undefined' || this.selectedLabelPackage === undefined){
                alert('Bạn chưa nhập vị trí trong kệ.');
            }else{
                let index = this.multipleScanRecords.findIndex(x => x.id == this.detail.id);
                this.multipleScanRecords[index] = this.detail;
                this.multipleScanRecords.map(barcodeResult => {
                    this.multipleScanRecordsShow.push(barcodeResult.barcode);    
                });
                
                findRecordListPackage({
                    ids: this.multipleScanRecordsShow
                })
                .then((records)=>{
                    
                    let testlabel = this.selectedLabelPackage;
                    for(let index = 0; index < records.length; index++){
                        let fieldWW = {};
                        if(records[index].Schedules__c != null){
                            fieldWW[WAREHOUSE_PACKITEM.fieldApiName] = records[index].Warehouse__c;
                            
                        }
                        fieldWW[PACKAGE_PACKITEM.fieldApiName] = records[index].Id;
                        if(records[index].Schedules__c != null){
                            fieldWW[NAME_PACKITEM.fieldApiName] = records[index].Name +' + '+records[index].Schedules__r.Destination_Warehouse__r.Name;
                            
                        }else{
                            fieldWW[NAME_PACKITEM.fieldApiName] = records[index].Name;
                        }

                        if(records[index].Schedules__c != null){
                            fieldWW[SCHEDULE_PACKITEM.fieldApiName] = records[index].Schedules__c;
                            
                        }
                        fieldWW[RACK_PACKITEM.fieldApiName] = testlabel;

                        let recordInputWW = {
                            apiName:PACKAGEITEM_OBJECT.objectApiName,
                            fields: fieldWW
                            
                        };
                            let fieldP = {};
                            fieldP[ID_PACK.fieldApiName] = records[index].Id;
                            fieldP[RACK_PACK.fieldApiName] = this.selectedLabelPackage;

                            let recordInputP = {
                                fields: fieldP
                            
                            };

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
                            window.location.reload();
                            })
                    
                            .catch(error => {
                            
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Scan package không thành công.',
                                        
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