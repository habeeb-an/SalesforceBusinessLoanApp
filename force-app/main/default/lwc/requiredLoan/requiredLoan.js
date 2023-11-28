import { LightningElement, track, wire } from 'lwc';

import getCompanyMonthlyRecords from '@salesforce/apex/XeroController.getCompanyMonthlyRecords';
import getCompanies from '@salesforce/apex/LoanApplicationController.getCompanies';

export default class RequiredLoan extends LightningElement {
    @track selectedCompanyId;
    @track monthlyRecords =[];
    @track companyOptions=[];
    @track columns = [
            { label: 'Year', fieldName: 'Year__c', type: 'number' },
            { label: 'Month', fieldName: 'Name'},
            { label: 'Profit/Loss Summary', fieldName: 'Profit_Loss_Summary__c', type: 'currency' },
            { label: 'Asset Value', fieldName: 'AssetValue__c', type: 'currency' }
        ];

    @wire(getCompanies)
    wiredCompanies({ error, data }) {
        if (data) {
            this.companyOptions = data.map(company => {
                return { label: company.Name, value: company.Id };
            });
        } else if (error) {
            console.log('data-table: error when getting companies:',financialData);

        }
    }

    handleCompanyChange(event) {
        this.selectedCompanyId = event.target.value;
        this.fetchMonthlyRecords();
      }


    fetchMonthlyRecords() {
        getCompanyMonthlyRecords({ companyId: this.selectedCompanyId })
            .then(result => {
                this.monthlyRecords = result;
                console.log('monthlyRecords:',JSON.stringify(monthlyRecords))
            })
            .catch(error => {
            console.log('data-table: error when getting monthly records:',error);

            });
    }
}
   
   