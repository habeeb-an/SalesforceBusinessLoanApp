public with sharing class XeroCallout {

    public String getConnections() {
        try {
            String accessToken = AuthUtil.getAccessToken();
            System.debug('Access Token:= ' + accessToken);
            Http h = new Http();

            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.xero.com/connections');
            req.setMethod('GET');
            req.setHeader('Authorization', 'Bearer ' + accessToken);
            HttpResponse res = h.send(req);

            if (res.getStatusCode() == 200) {
                List<Object> connections = (List<Object>) JSON.deserializeUntyped(res.getBody());
                Map<String, Object> connection = (Map<String, Object>) connections[0];
                String tenantId = (String) connection.get('tenantId');

                if (tenantId != null) {
                    System.debug('Tenant ID:' + tenantId);
                    return tenantId;
                } else {
                    System.debug('Tenant ID not available in response');
                    return null;
                }
            } else {
                System.debug('Error in getting tenantId request. Status Code: ' + res.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            System.debug('Error getting access token: ' + e.getMessage());
            return null;
        }
    }
    public Map<String, Object> getProfitAndLoss() {
        
            String accessToken = AuthUtil.getAccessToken();
            XeroCallout xero=new XeroCallout();
            String tenantId = xero.getConnections();
            System.debug('getProfitAndLossTenantid='+tenantId);
        try {
            HttpRequest req = new HttpRequest();
            req.setMethod('GET');

            Date fromDate = Date.valueOf('2022-01-01');
            Date toDate = Date.valueOf('2022-12-01');
            Integer periods = 11;
            String timeframe = 'MONTH';

            String params = 'fromDate=' + String.valueOf(fromDate) +
                            '&toDate=' + String.valueOf(toDate) +
                            '&periods=' + String.valueOf(periods) +
                            '&timeframe=' + timeframe ;

            req.setEndpoint('https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss' + '?' + params);

            req.setHeader('Authorization', 'Bearer ' + accessToken);
            req.setHeader('xero-tenant-id', tenantId);
            req.setHeader('Content-Type', 'application/json');

            HttpResponse res = new Http().send(req);

            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                System.debug('Profit/Loss report=' + responseBody);
                return responseBody;
            } else {
                System.debug('Error in API request. Status Code: ' + res.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            System.debug('Exception:Failed at Profit/Loss' + e.getMessage());
            return null;
        }
    }


   
   
public Map<String, Object>  getBalanceSheet() {
            
        String accessToken = AuthUtil.getAccessToken();
        XeroCallout xero=new XeroCallout();
        String tenantId = xero.getConnections();
    try {  
        Date balsheetDate = Date.valueOf('2022-12-01'); 
        Integer balsheetPeriods = 11;
        String balsheetTimeframe = 'MONTH';
        
        String params = 'date=' + String.valueOf(balsheetDate) + 
                        '&periods=' + balsheetPeriods + 
                        '&timeframe=' + balsheetTimeframe;
        
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');   
        req.setEndpoint('https://api.xero.com/api.xro/2.0/Reports/BalanceSheet?' + params);
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('xero-tenant-id', tenantId);
        req.setHeader('Content-Type', 'application/json');
        

        HttpResponse res = new Http().send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            System.debug('BalanceSheet report=' + responseBody);
            return responseBody;
        } else {
            System.debug('Error in BalanceSheet API request. Status Code: ' + res.getStatusCode());
            return null;
        }
    } catch (Exception e) {
        System.debug('Exception:Failed at BalanceSheet' + e.getMessage());
        return null;
    }

}
}