import { LightningElement, wire, track } from 'lwc';
import getAllLoanApplications from '@salesforce/apex/LoanApplicationController.getAllLoanApplications';
import getCompanies from '@salesforce/apex/LoanApplicationController.getCompanies';
import getBanks from '@salesforce/apex/LoanApplicationController.getBanks';

export default class EligibilityCheck extends LightningElement {

    @track loanApplications = [];
    @track filteredApplications = [];
    selectedCompanyId = '';
    selectedBankId = '';
    @track columns = [
        { label: 'Application Name', fieldName: 'Name', type: 'text' },
        { label: 'Company Name', fieldName: 'CompanyName', type: 'text' },
        { label: 'Bank Name', fieldName: 'BankName', type: 'text' },
        { label: 'Loan Amount', fieldName: 'Requested_Amount__c', type: 'currency' },]

    @wire(getCompanies)
    companies;
    @wire(getBanks)
    banks;
    @wire(getAllLoanApplications)
    loanApplications({error,data}){
        if (data) {
            this.loanApplications = data.map(app => {
                return {
                    ...app, 
                    CompanyName: app.Company__r.Name, 
                    BankName: app.Bank__r.Name 
         } })
        //  console.log('List of loan applications:',JSON.stringify(this.loanApplications));

    }else if(error ) {
               console.log('Error when getting all loan application list',error)
            }
    }


    get companyOptions() {
        return this.companies.data ? this.companies.data.map(company => ({ label: company.Name, value: company.Id })) : [];
    }

    get bankOptions() {
        return this.banks.data ? this.banks.data.map(bank => ({ label: bank.Name, value: bank.Id })) : [];
    }
    // connectedCallback() {
    //     this.loadLoanApplications();
    // }

    

    handleCompanyChange(event) {
        this.selectedCompanyId = event.detail.value;
        this.applyFilters();
    }

    handleBankChange(event) {
        this.selectedBankId = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredApplications = this.loanApplications.filter(app => {
            return (this.selectedCompanyId === '' || app.Company__c === this.selectedCompanyId) &&
                   (this.selectedBankId === '' || app.Bank__c=== this.selectedBankId);
                });
    }
}