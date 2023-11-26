public with sharing class LoanEligibility{
    @AuraEnabled(cacheable=false)
    public static List<MonthlyFinancialData__c> fetchFinancialData() {
        return [SELECT Name, Profit_Loss_Summary__c, AssetValue__c FROM MonthlyFinancialData__c ORDER BY CreatedDate DESC];
    }

    @AuraEnabled
    public static Decimal calculateLoanEligibility(Decimal loanAmount, Decimal totalProfit, Decimal totalAssetValue) {
        Decimal eligibility =20;
        if (totalProfit > 0) {
            eligibility = 60;
        }
        if (totalAssetValue >=loanAmount) {
            eligibility = 100;
        }
        return eligibility;

    }
}
