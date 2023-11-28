public with sharing class LoanEligibility{
    @AuraEnabled
    public static Decimal getLoanEligibility(Id companyId,Decimal loanAmount) {
        if (companyId == null) {
            throw new IllegalArgumentException('Company ID cannot be null.');
        }
        Company__c company = [SELECT TotalAssetValue__c, TotalProfit_LossSummary__c FROM Company__c WHERE Id = :companyId LIMIT 1];

        Decimal eligibility = calculateLoanEligibility(loanAmount, company.TotalProfit_LossSummary__c, company.TotalAssetValue__c);


        return eligibility;
    }

    @AuraEnabled
    public static Decimal calculateLoanEligibility(Decimal loanAmount, Decimal totalProfit, Decimal totalAssetValue) {
        Decimal eligibility = 20;
        if (totalProfit > 0) {
            eligibility = 60;
        }
        if (totalAssetValue >= loanAmount) {
            eligibility = 100;
        }
        return eligibility;
    }
}