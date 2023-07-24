public with sharing class scanQRMultiController {
    @AuraEnabled(cacheable=true)
    public static List<F_TMS_SO__c>  findRecord(String id) {
        List<F_TMS_SO__c> m = new List<F_TMS_SO__c>([
            SELECT Id, 
        Name,
        Status__c,
        Warehouse__c,
        Warehouse__r.Name,
        Parcel_name__c,
        Gross_Weight__c,
        Measurement_Total_CBM__c,
        Warehouse_Location__c,
        Warehouse_Location__r.Name,
        Truck__c,
        Truck__r.Name,
        Schedule_ID__c,
        Schedule_ID__r.RecordType.Name,
        Schedule_ID__r.Order_Record_Type__c,
        Schedule_ID__r.RecordTypeId,
        Schedule_ID__r.Schedule_Status__c,
        Schedule_Record_Type_Text__c,
        Schedulestatus__c,
        Schedule_Record_Type__c,
        Receiver_Name__c,
        Parcel_category__c,
        RecordType.Name,
        Number_of_package__c,
        Shipper__c,
        Shipper__r.Name,
        Schedule_ID__r.Destination_Warehouse__c,
        Destination_Warehouse__c
            FROM F_TMS_SO__c 
            WHERE Id =: id]);
        
        return m;
    }
}