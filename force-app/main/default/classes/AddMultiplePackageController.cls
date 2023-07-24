public with sharing class AddMultiplePackageController {
    @AuraEnabled
    public static String getFieldLabels(){
        try {
            Map<String, String> fieldLabels = new Map<String, String>();
            fieldLabels.put('Sender_Name__c', SObjectType.F_TMS_SO__c.fields.Sender_Name__c.getLabel());
            fieldLabels.put('Sender_City_Province__c', SObjectType.F_TMS_SO__c.fields.Sender_City_Province__c.getLabel());
            fieldLabels.put('Sender_Phone__c', SObjectType.F_TMS_SO__c.fields.Sender_Phone__c.getLabel());            
            fieldLabels.put('Sender_District__c', SObjectType.F_TMS_SO__c.fields.Sender_District__c.getLabel());
            fieldLabels.put('Sender_Ward__c', SObjectType.F_TMS_SO__c.fields.Sender_Ward__c.getLabel());
            fieldLabels.put('Sender_Address__c', SObjectType.F_TMS_SO__c.fields.Sender_Address__c.getLabel());
            fieldLabels.put('Receiver_Name__c', SObjectType.F_TMS_SO__c.fields.Receiver_Name__c.getLabel());
            fieldLabels.put('Receiver_City_Province__c', SObjectType.F_TMS_SO__c.fields.Receiver_City_Province__c.getLabel());
            fieldLabels.put('Receiver_Phone__c', SObjectType.F_TMS_SO__c.fields.Receiver_Phone__c.getLabel());
            fieldLabels.put('Receiver_District__c', SObjectType.F_TMS_SO__c.fields.Receiver_District__c.getLabel());
            fieldLabels.put('Receiver_Ward__c', SObjectType.F_TMS_SO__c.fields.Receiver_Ward__c.getLabel());
            fieldLabels.put('Receiver_address__c', SObjectType.F_TMS_SO__c.fields.Receiver_address__c.getLabel());

            fieldLabels.put('Invoice_To__c', SObjectType.F_TMS_SO__c.fields.Invoice_To__c.getLabel());
            fieldLabels.put('Need_To_COD__c', SObjectType.F_TMS_SO__c.fields.Need_To_COD__c.getLabel());
            fieldLabels.put('E_shipping_charge__c', SObjectType.F_TMS_SO__c.fields.E_shipping_charge__c.getLabel());
            fieldLabels.put('codeuqalcargovalue__c', SObjectType.F_TMS_SO__c.fields.codeuqalcargovalue__c.getLabel());
            fieldLabels.put('Waiting_Time_day__c', SObjectType.F_TMS_SO__c.fields.Waiting_Time_day__c.getLabel());
            fieldLabels.put('Cash_on_delivery__c', SObjectType.F_TMS_SO__c.fields.Cash_on_delivery__c.getLabel());
            fieldLabels.put('Discount_code__c', SObjectType.F_TMS_SO__c.fields.Discount_code__c.getLabel());
            fieldLabels.put('Insurance__c', SObjectType.F_TMS_SO__c.fields.Insurance__c.getLabel());
            fieldLabels.put('Lift_On_Lift_Off__c', SObjectType.F_TMS_SO__c.fields.Lift_On_Lift_Off__c.getLabel());
            fieldLabels.put('Ph_b_c_x_p_1_u__c', SObjectType.F_TMS_SO__c.fields.Ph_b_c_x_p_1_u__c.getLabel());
            fieldLabels.put('Ph_b_c_x_p_2_u__c', SObjectType.F_TMS_SO__c.fields.Ph_b_c_x_p_2_u__c.getLabel());
            fieldLabels.put('Toll__c', SObjectType.F_TMS_SO__c.fields.Toll__c.getLabel());
            fieldLabels.put('Shipping_Payment_remarks__c', SObjectType.F_TMS_SO__c.fields.Shipping_Payment_remarks__c.getLabel());
            fieldLabels.put('Parcel_name__c', SObjectType.F_TMS_SO__c.fields.Parcel_name__c.getLabel());
            fieldLabels.put('Parcel_category__c', SObjectType.F_TMS_SO__c.fields.Parcel_category__c.getLabel());
            fieldLabels.put('Length_cm__c', SObjectType.F_TMS_SO__c.fields.Length_cm__c.getLabel());
            fieldLabels.put('Width_cm__c', SObjectType.F_TMS_SO__c.fields.Width_cm__c.getLabel());
            fieldLabels.put('Height_cm__c', SObjectType.F_TMS_SO__c.fields.Height_cm__c.getLabel());

            fieldLabels.put('Parcel_Name__c', SObjectType.Package__c.fields.Parcel_Name__c.getLabel());
            fieldLabels.put('Parcel_Value__c', SObjectType.Package__c.fields.Parcel_Value__c.getLabel());
            fieldLabels.put('Gross_Weight_Kg__c', SObjectType.Package__c.fields.Gross_Weight_Kg__c.getLabel());
            fieldLabels.put('Quantity__c', SObjectType.Package__c.fields.Quantity__c.getLabel());

            return JSOn.serialize(fieldLabels);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String savePackage(F_TMS_SO__c order, List<Package__c> lstPackage){
        System.debug('1234:' + lstPackage);
        String getId = '';
        try {
            Insert order;
        for(Package__c pack : lstPackage){
            // pack.F_TMS_SO__c = order.get(0).Id;
            pack.F_TMS_SO__c = order.Id;
        }
            Insert lstPackage;
            getId = order.Id; 
            return getId;  
        } catch (DmlException e) {
            throw e;      
        }
    }
}