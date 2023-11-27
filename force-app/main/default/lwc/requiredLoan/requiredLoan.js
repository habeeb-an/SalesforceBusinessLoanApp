import { LightningElement, track, wire } from 'lwc';
import fetchFinancialData from '@salesforce/apex/LoanEligibilityCalculator.fetchFinancialData';
import calculateLoanEligibility from '@salesforce/apex/LoanEligibilityCalculator.calculateLoanEligibility';

export default class RequiredLoan extends LightningElement {
    @track loanAmount = 0;
    @track companyName='CompanyName';
    @track yearEstablished='(year)';
    @track loanEligibility = 0; 
    @track financialData = [];
    @track error;
    @track columns = [
        { label: 'Month', fieldName: 'Name' },
        { label: 'Profit/Loss Summary', fieldName: 'Profit_Loss_Summary__c', type: 'currency' },
        { label: 'Asset Value', fieldName: 'AssetValue__c', type: 'currency' }
    ];
    @wire(fetchFinancialData)
    wiredFinancialData({ error, data }) {
        if (data) {
            this.financialData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.financialData = undefined;
        }
    }
   
    handleLoanAmountChange(event) {
        this.loanAmount = event.target.value;
    }
    handleCompanyNameChange(event) {
        this.companyName = event.target.value;
      }
    
    handleYearEstablishedChange(event) {
        this.yearEstablished = event.target.value;
      }


    calculateEligibility() {
        let totalProfit =this.financialData.reduce((total, month) => total + month.Profit_Loss_Summary__c, 0);
        let totalAssetValue= this.financialData.reduce((total, month) => total + month.AssetValue__c, 0);
        calculateLoanEligibility({ loanAmount: this.loanAmount, totalProfit: totalProfit, totalAssetValue: totalAssetValue })
            .then(result => {
                this.loanEligibility = result;
                console.log('result of loan eligiibilty',result);
            })
            .catch(error => {
                this.error = error;
            });
    }
}
