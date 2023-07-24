public with sharing class scanQRScheduleController {
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


        FROM F_TMS_SO__c WHERE M_v_n_n__c =: id];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }
    @AuraEnabled(cacheable=true)
    public static F_TMS_SO__c  findRecord(String id) {
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

        FROM F_TMS_SO__c WHERE M_v_n_n__c =: id];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }
    @AuraEnabled
    public static Schedules__c findSchedule(String id){
        Schedules__c rs = [SELECT Finish_adding_order__c,Order_Record_Type__c,RecordType.Name FROM Schedules__c WHERE Id = :id];
        return rs;
    }
    @AuraEnabled(cacheable=true)
    public static List<F_TMS_SO__c> findRecordList(List<String> ids) {
        List<F_TMS_SO__c> ship = [SELECT Id, 
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
        RecordTypeId,
        Number_of_package__c,
        Shipper__c,
        Shipper__r.Name,
        Schedule_ID__r.Destination_Warehouse__c,
        Destination_Warehouse__c

        FROM F_TMS_SO__c WHERE M_v_n_n__c IN :ids];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }
   
}