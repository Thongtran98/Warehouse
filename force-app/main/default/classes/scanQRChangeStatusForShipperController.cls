public with sharing class scanQRChangeStatusForShipperController {
    @AuraEnabled(cacheable=true)
    public static F_TMS_SO__c  findRecordType(String id) {
        // F_TMS_SO__c ship = [SELECT Id, Name,Status__c FROM F_TMS_SO__c WHERE Id =: id];
        // return ship;
        F_TMS_SO__c ship = [SELECT Id, 
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
        Schedule_ID__r.RecordTypeId,
        Schedule_ID__r.Schedule_Status__c,
        Schedule_Record_Type_Text__c,
        Schedulestatus__c,
        Schedule_Record_Type__c,
        Receiver_Name__c,
        Parcel_category__c,
        RecordType.Name,
        Schedule_ID__r.Order_Record_Type__c


        FROM F_TMS_SO__c WHERE Id =: id];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }
    @AuraEnabled(cacheable=true)
    public static F_TMS_SO__c  findRecord(String id) {
        // F_TMS_SO__c ship = [SELECT Id, Name,Status__c FROM F_TMS_SO__c WHERE Id =: id];
        // return ship;
        F_TMS_SO__c ship = [SELECT Id, 
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
        Schedule_ID__r.RecordTypeId,
        Schedule_ID__r.Schedule_Status__c,
        Schedule_Record_Type_Text__c,
        Schedulestatus__c,
        Schedule_Record_Type__c,
        Receiver_Name__c,
        Parcel_category__c,
        RecordType.Name,
        RecordTypeId,
        Schedule_ID__r.Order_Record_Type__c


        FROM F_TMS_SO__c WHERE Id =: id];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }
    @AuraEnabled
    public static Schedules__c findSchedule(String id){
        Schedules__c rs = [SELECT Order_Record_Type__c,RecordType.Name FROM Schedules__c WHERE Id = :id];
        return rs;
    }
}