public with sharing class XeroController {
    @AuraEnabled
    public static void HandleXeroFinancials(String companyId, String sheet) {

    List<SheetData> sheetDataDecoded=(List<SheetData>) JSON.deserialize(sheet,List<SheetData>.class);
    Map<String, Integer> yearRecordCount = new Map<String, Integer>();

        List<MonthlyFinancials__c> financialsToInsert = new List<MonthlyFinancials__c>();
        try { 
            for (SheetData data : sheetDataDecoded) {
                System.debug('sheet'+data);
                
                if (!yearRecordCount.containsKey(data.year)) {
                    Integer count = [SELECT Count() FROM MonthlyFinancials__c WHERE Company__c = :companyId AND Year__c = :data.year];
                    yearRecordCount.put(data.year, count);

                }
                yearRecordCount.put(data.year, yearRecordCount.get(data.year) + 1);
                if (yearRecordCount.get(data.year) > 12) {
                    throw new AuraHandledException('Exceeded the limit of 12 records for the year ' + data.year);
                }
                MonthlyFinancials__c newFinancial = new MonthlyFinancials__c(
                Company__c = companyId,
                Year__c = data.year,
                Name = data.month,
                Profit_Loss_Summary__c = data.profitOrLoss,
                AssetValue__c = data.assetsValue
            );
            financialsToInsert.add(newFinancial);
        }
        insert financialsToInsert;
        } catch (DmlException e) {
            System.debug('error when creating record for Xero monthly financial data: ' + e.getMessage());
        }   
    }

@AuraEnabled
public static List<MonthlyFinancials__c> getCompanyMonthlyRecords(String companyId) {
    try {
        List<MonthlyFinancials__c> records=  [SELECT id,Name,Profit_Loss_Summary__c,AssetValue__c,Year__c FROM MonthlyFinancials__c WHERE Company__c= :companyId];
    System.debug('getCompanyMonthlyRecords'+records);
    return records;
        
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

public class SheetData {
        public String year;
        public String month;
        public Decimal profitOrLoss;
        public Decimal assetsValue;
    }
}

