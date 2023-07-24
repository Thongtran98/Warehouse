import { LightningElement, api, track } from 'lwc';
import scannerPicker from './scanner-picker.html';
import barcodeListPage from './barcodeSchedule.html';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import detailPage from './detail.html';
import { RefreshEvent } from 'lightning/refresh';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import findRecord from '@salesforce/apex/scanQRScheduleController.findRecord';
import findSchedule from '@salesforce/apex/scanQRScheduleController.findSchedule';
import findRecordList from '@salesforce/apex/scanQRScheduleController.findRecordList';
// import findWarehouse from '@salesforce/apex/scanQRChangeStatusSOController.findWarehouse';
// import findWarehouseLocation from '@salesforce/apex/scanQRChangeStatusSOController.findWarehouseLocation';
// import findWarehouseLocationByNameAndWH from '@salesforce/apex/scanQRChangeStatusSOController.findWarehouseLocationByNameAndWH';
import SCHEDULEID_FIELD from '@salesforce/schema/F_TMS_SO__c.Schedule_ID__c';
import ID_FIELD from '@salesforce/schema/F_TMS_SO__c.Id';
import STATUS_FIELD from '@salesforce/schema/F_TMS_SO__c.Status__c';
import { CloseActionScreenEvent } from "lightning/actions";
import Alias from '@salesforce/schema/User.Alias';
// import resources from '@salesforce/resourceUrl/barcodeScanner';

export default class BarcodeSchedule extends LightningElement {

    // splashLogo = `${resources}/barcodeScannerResource/splashScreen.svg`;

    barcodeScanner;
    screenNumber = "1";
    selectedTab = "multi";

    showSettings = false;
    
    detailType;
    @track detail;
    @track error;
    @track selectedLabel;
    @api recordId;
    // @track labelWa;
    // @track valueWa;

    @track singleScanRecords = [];
    @track singleScanRecordsShow = [];
    @track multipleScanRecords = [];
    @track warehousePiclist = [];
    @track warehouseShow = [];
    value = 'WarehouseLocation';

    // eslint-disable-next-line consistent-return
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
                    if(record.Status__c === 'Tạo mới' || record.Status__c === 'Đã nhập kho'){
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
                    }else{
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Thêm đơn hàng vào danh sách thất bại vì status không thỏa điều kiện.',
                                // message: error.body.message,
                                variant: 'error'
                            })
                        );
                    }
                     
                    // findWarehouseLocation({warehouse: record.Schedule_ID__r.Destination_Warehouse__c})
                    // .then((recordLocation) =>{
                    //     let lstWarehouse = [];
                    //     for (let index = 0; index < recordLocation.length; index++) {
                    //         lstWarehouse.push({label: recordLocation[index].Name, value: recordLocation[index].Id});
                    //         // alert(recordLocation[index].Name);
                    //     }
                    //     this.warehouseShow = lstWarehouse;
                    // })
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
        this.selectedLabel = event.target.options.find(opt => opt.value === event.detail.value).value;
    }
    openMultiScan() {
        this.selectedTab = "multi";
        if (this.barcodeScanner.isAvailable()) {
            this.barcodeScanner.beginCapture(
                { barcodeTypes: this.selectedBarcodeTypes() }
            )
            .then((barcode) => this.addMultiScannedBarcode(barcode))
            .catch(error => {
                this.error = error;
                this.barcodeScanner.endCapture();
            })
            .finally(() => this.continueMultiScan());
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
                    // alert(records[index].Name);
                    // alert(records[index].Id);
                    // alert(this.recordId);
                    findSchedule({id: this.recordId})             
                    .then((scheduleRecord)=>{
                        // alert(scheduleRecord.RecordType.Name);
                        const fields = {};
                        fields[ID_FIELD.fieldApiName] = records[index].Id;
                        // fields[SCHEDULEID_FIELD.fieldApiName] = this.recordId;
                        
                        if(scheduleRecord.RecordType.Name === 'Lấy hàng'){
                            if(records[index].Status__c == 'Tạo mới'){
                                fields[STATUS_FIELD.fieldApiName] = 'Tạo mới';
                                fields[SCHEDULEID_FIELD.fieldApiName] = this.recordId;
                            }

                        }else if(scheduleRecord.RecordType.Name === 'Luân chuyển nội bộ' || scheduleRecord.RecordType.Name === 'Phát hàng' || scheduleRecord.RecordType.Name === 'Đơn vị vận chuyển ngoài'){
                            if(records[index].Status__c == 'Đã nhập kho'){
                                fields[STATUS_FIELD.fieldApiName] = 'Đã nhập kho';
                                fields[SCHEDULEID_FIELD.fieldApiName] = this.recordId;
                            }
                        }
                        const recordInput = { fields };
                        
                        if(scheduleRecord.Finish_adding_order__c === false){
                            // alert(records[index].RecordType.Name);
                            // alert(scheduleRecord.Order_Record_Type__c);
                            let test1;
                            test1 = records[index].RecordType.Name.replace(' -', '').toLowerCase();
                            // alert(test1);
                            if((records[index].RecordType.Name.replace(' -', '')).toLowerCase() == (scheduleRecord.Order_Record_Type__c.replace(' -', '')).toLowerCase()){
                                if((records[index].Status__c == 'Tạo mới' && scheduleRecord.RecordType.Name === 'Lấy hàng') || (records[index].Status__c == 'Đã nhập kho' && (scheduleRecord.RecordType.Name === 'Luân chuyển nội bộ' || scheduleRecord.RecordType.Name === 'Phát hàng'))){
                                    updateRecord(recordInput)
                                    .then(() => {
                                        this.scannedBarcode = 'Đơn hàng ' + records[index].Name +' thêm vào thành công.';

                                        this.dispatchEvent(
                                            new ShowToastEvent({
                                                title: 'Scan thành công',
                                            
                                                variant: 'success',
                                            })
                                        );
                                        window.location.reload();
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
                                            title: 'Đơn hàng ' + records[index].Name +' không thể thêm vào lệnh vì khác loại.',
                                            
                                            variant: 'error'
                                        })
                                    );
                                }
    
                            }else{
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Đơn hàng ' + records[index].Name +' không thể thêm vào lệnh vì khác Record Type.',
                                    
                                        variant: 'error'
                                    })
                                );
                                
                            } 
                        }else{
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Không thể thêm đơn hàng vì lệnh đã được hoàn thành thêm hàng.',
                                
                                    variant: 'error'
                                })
                            );
                        }
                    })
                    .catch(error => {
                        alert('Scan không thành công123567.')
                    })
                            
                }
            })
            .catch(error => {
                alert('Scan không thành công123.')
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
        // let element = [];
        // for (let index = 0; index < this.singleScanRecords.length; index++) {
        //     element = array[index];
        //     return element.name;
        // }
        
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