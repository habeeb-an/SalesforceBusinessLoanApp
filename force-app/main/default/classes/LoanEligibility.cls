public with sharing class LoanEligibility{
    @AuraEnabled(cacheable=true)
    public static List<MonthlyFinancialData__c> fetchFinancialData() {
        return [SELECT Name, Profit_Loss_Summary__c, AssetValue__c FROM MonthlyFinancialData__c ORDER BY CreatedDate];
    }
    // List<MonthlyFinancialData__c> monthlydata=[SELECT Name, Profit_Loss_Summary__c, AssetValue__c FROM MonthlyFinancialData__c ORDER BY CreatedDate];
    //Decimal ProfitLoss=0;
    //Decimal AssetValue=0;
    //for(MonthlyFinancialData__c record:monthlydata){
       // ProfitLoss+=record.Profit_Loss_Summary__c;
       // AssetValue+=record.AssetValue__c;
   // }
   fetchFinancialData res=new fetchFinancialData();
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
        //calculateLoanEligibility res= new calculateLoanEligibility();
        // res.monnthlydata=monnthlydata;
        //res.ProfitLoss=ProfitLoss;
        //res.AssetValue=AssetValue;
        //res.eligibility=eligibility;
        // return res
        
    }
}
