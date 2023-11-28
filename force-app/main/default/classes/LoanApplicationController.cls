public with sharing class LoanApplicationController {

    @AuraEnabled(cacheable=true)
    public static List<Company__c> getCompanies() {
        return [SELECT Id, Name FROM Company__c LIMIT 100];
    }

    @AuraEnabled(cacheable=true)
    public static List<Bank__c> getBanks() {
        return [SELECT Id, Name, Total_Asset__c  FROM Bank__c LIMIT 100];
    }
//for Loan Application Listing LWC
@AuraEnabled(cacheable=true)
public static List<Loan_Application_Data__c> getAllLoanApplications() {
    return [SELECT Id, Name, Company__r.Name, Bank__r.Name, Requested_Amount__c,
     Company__r.TotalAssetValue__c, Company__r.TotalProfit_LossSummary__c,Status__c
            FROM Loan_Application_Data__c];
}


    @AuraEnabled
    public static Loan_Application_Data__c createLoanApplication(String companyId, String bankId, Decimal amount) {
        Decimal status=LoanEligibility.getLoanEligibility(companyId, amount);
        Loan_Application_Data__c newApplication = new Loan_Application_Data__c(
            Company__c = companyId,
            Bank__c = bankId,
            Requested_Amount__c = amount,
            Status__c =  status + '% loan issued'
        );
        insert newApplication;
        return newApplication;
    }

    @AuraEnabled
    public static Bank_Monthly_data__c createBankMonthlyData(String companyId, Decimal loanAmount, String bankId){
        Decimal eligibility=LoanEligibility.getLoanEligibility(companyId, loanAmount);
        try {
            Bank_Monthly_data__c newApplication=new Bank_Monthly_data__c();
                Date today = Date.today();
                newApplication.Name=String.valueOf(today);
                newApplication.Loan_Amount_Issued__c=loanAmount*(eligibility/100);
                newApplication.Year__c=today.year();
                newApplication.Bank__c= bankId;

                insert newApplication;
                return newApplication;
            

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Company__c saveNewCompany(String name, String industry, String contactInfo) {
        Company__c newCompany = new Company__c();
        newCompany.Name = name;
        newCompany.Industry__c = industry;
        newCompany.Contact_Information__c = contactInfo;
        insert newCompany;
        return newCompany;
    }
}