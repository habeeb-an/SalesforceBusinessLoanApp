import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCompanies from '@salesforce/apex/LoanApplicationController.getCompanies';
import getBanks from '@salesforce/apex/LoanApplicationController.getBanks';
import createLoanApplication from '@salesforce/apex/LoanApplicationController.createLoanApplication';
import saveNewCompany from '@salesforce/apex/LoanApplicationController.saveNewCompany';
import getProfitAndLoss from '@salesforce/apex/XeroCallout.getProfitAndLoss';
import getBalanceSheet from '@salesforce/apex/XeroCallout.getBalanceSheet';

export default class LoanApplicationManager extends LightningElement {
    @track selectedCompanyId;
    @track selectedBankId;
    @track loanAmount;
    @track financialData = [];
    //company
    @track isAddCompanyFormVisible = false;
    @track newCompanyName;
    @track industry;
    @track contactInfo;
    @track isXeroCompanySelected = false;


    @wire(getCompanies)
    companies;

    @wire(getBanks)
    banks;

    get companyOptions() {
        return this.companies.data ? this.companies.data.map(company => ({ label: company.Name, value: company.Id })) : [];
    }
    get bankOptions() {
        return this.banks.data ? this.banks.data.map(bank => ({ label: bank.Name, value: bank.Id })) : [];
    }

//hidebutton
     hideAddCompanyForm() {
        this.isAddCompanyFormVisible = false;
    }
    hideXeroCompanySection() {
        this.isXeroCompanySelected = false;
    }
    handleXeroCompany() {
        this.isXeroCompanySelected = true; 
    }

    //for xero
    handleXeroCompanyChange(event) {
        const selectedCompanyId = event.detail.value;
    }
    
//for company adding 
    showAddCompanyForm() {
        this.isAddCompanyFormVisible = true;
    }
    handleNewCompanyNameChange(event) {
        this.newCompanyName = event.target.value;
    }
    handleIndustryChange(event) {
        this.industry = event.target.value;
    }
    handleContactInfoChange(event) {
        this.contactInfo = event.target.value;
    }

//for loanappplication
    handleCompanyChange(event) {
        this.selectedCompanyId = event.detail.value;
    }
    handleBankChange(event) {
        this.selectedBankId = event.detail.value;
    }
    handleAmountChange(event) {
        this.loanAmount = event.target.value;
    }
    
    submitApplication() {
        createLoanApplication({ companyId: this.selectedCompanyId, bankId: this.selectedBankId, amount: this.loanAmount })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Loan application created successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
            console.log('Error object:', JSON.stringify(error, null, 2));

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error creating loan application: ' + error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    saveNewCompany() {
        saveNewCompany({ 
            name: this.newCompanyName,
            industry: this.industry,
            contactInfo: this.contactInfo
        })
        .then(result => {
            this.isAddCompanyFormVisible = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Company added successfully',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error adding company: ' + error.body.message,
                    variant: 'error'
                })
            );

        });
    }
//parse profit/asset

connectedCallback(){
    this.syncBalanceSheet() 
}
 syncBalanceSheet() {
    try {
        const balanceSheetResponse =  getBalanceSheet();
        const profitLossResponse =  getProfitAndLoss();
        console.log('balanceSheetResponse=',profitLossResponse)
        this.processFinancialData(balanceSheetResponse, profitLossResponse);
    } catch (error) {
        console.error('Error fetching financial data=', error);
    }
}
}
