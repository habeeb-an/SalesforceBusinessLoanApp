import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getCompanies from '@salesforce/apex/LoanApplicationController.getCompanies';
import getBanks from '@salesforce/apex/LoanApplicationController.getBanks';
import createLoanApplication from '@salesforce/apex/LoanApplicationController.createLoanApplication';
import saveNewCompany from '@salesforce/apex/LoanApplicationController.saveNewCompany';
import createBankMonthlyData from '@salesforce/apex/LoanApplicationController.createBankMonthlyData';

import getProfitAndLoss from '@salesforce/apex/XeroCallout.getProfitAndLoss';
import getBalanceSheet from '@salesforce/apex/XeroCallout.getBalanceSheet';

import HandleXeroFinancials from '@salesforce/apex/XeroController.HandleXeroFinancials';
import getLoanEligibility from '@salesforce/apex/LoanEligibility.getLoanEligibility';

export default class LoanApplicationManager extends LightningElement {
    @track selectedCompanyId;
    @track selectedBankId;
    @track loanAmount;
    @track xeroCompany;
    @track financialData = [];
    //company
    @track isAddCompanyFormVisible = false;
    @track newCompanyName;
    @track industry;
    @track contactInfo;
    @track isXeroCompanySelected = false;
    @track sheet=[];

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
         this.xeroCompany = event.detail.value;
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
        getLoanEligibility({ companyId: this.selectedCompanyId, loanAmount: this.loanAmount })
            .then(eligibility => {
                
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Eligibility Check',
                    message: 'Your loan eligibility is: ' + eligibility + '%',
                    variant: 'success'
                }));

                //loan application
                return createLoanApplication({ companyId: this.selectedCompanyId, bankId: this.selectedBankId, amount: this.loanAmount });
            })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Loan application created successfully',
                    variant: 'success'
                }));
                //monhly data
                return createBankMonthlyData({ companyId: this.selectedCompanyId, loanAmount: this.loanAmount, bankId: this.selectedBankId });
            })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Monthly bank data created successfully',
                    variant: 'success'
                }));
            })
            .catch(error => {
                console.log('Error object:', JSON.stringify(error, null, 2));
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Error occurred: ' + error.message,
                    variant: 'error',
                }));
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

// connectedCallback(){
//     this.syncBalanceSheet() 
// }
 async syncBalanceSheet() {
    try {
        const balanceSheetResponse =  await getBalanceSheet();
        const profitLossResponse =  await getProfitAndLoss();
    

        console.log('balanceSheetResponse:',profitLossResponse)

        //balanceSheetResponse
        const balanceSheetRows = balanceSheetResponse.Reports[0].Rows;
        // console.log('balanceSheetResponseRow:',balanceSheetRows)

        const balanceSheetHeaderRow = balanceSheetRows.find(row => row.RowType === 'Header');
        console.log('balanceSheetHeaderRow:',balanceSheetHeaderRow)

        const netAssetsSection = balanceSheetRows.find(row => row.RowType === 'Section' && row.Title=== ''&& row.Rows[0].Cells[0].Value  === 'Net Assets'); 
        // console.log('netAssetsSection:',netAssetsSection)
        
        const netAssetsRow = netAssetsSection.Rows[0];
        console.log('netAssetsRow:',netAssetsRow)

        //profitLossResponse
        const profitLossRows = profitLossResponse.Reports[0].Rows;
        console.log('profitLossRows:',profitLossRows)

        const netptofitsection = profitLossRows.find(row => row.RowType === 'Section' && row.Title === '' && row.Rows[0].Cells[0].Value === 'Net Profit');
        const netProfitRow = netptofitsection.Rows[0];
        console.log('netProfitRow:',netProfitRow)


        for (let i=1; i<netAssetsRow.Cells.length; i++) {
          const headerCell = balanceSheetHeaderRow.Cells[i];
          const netAssetValueCell = netAssetsRow.Cells[i];
          const dateformat=headerCell.Value.split(' ')
          const month=dateformat[1];
          const year=dateformat[2]
          const netProfitValueCell = netProfitRow.Cells[i];
    //   console.log({headerCell,netAssetValueCell,dateformat,month,year,netProfitValueCell});
      
          this.sheet.push({
            year,
            month,
            profitOrLoss:parseFloat(netProfitValueCell.Value),
            assetsValue: parseFloat(netAssetValueCell.Value)
      
          });
        // console.log({profitOrLoss:netProfitValueCell.Value});
      
        }
        
                    //xero
            console.log(this.xeroCompany, JSON.stringify(this.sheet.reverse()));
            // console.log('test',this.xeroCompany, {...this.sheet});
            // const sheetData=JSON.parse(JSON.stringify(this.sheet))
            // console.log('sheetData=',sheetData);
            let reversedSheet = this.sheet.reverse();
            console.log("Reversed:", reversedSheet);
            let json = JSON.stringify(reversedSheet);

            await HandleXeroFinancials({ companyId: this.xeroCompany, sheet: json })
            .then(result => {
                // this.isAddCompanyFormVisible = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Company monthly details added successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error adding company monthly details: ' + error.body.message,
                        variant: 'error'
                    })

                );
        console.error('Error in xero company data:', error);

            });
        
    } catch (error) {
        console.error('Error fetching financial data:', error);
    }
}
}
