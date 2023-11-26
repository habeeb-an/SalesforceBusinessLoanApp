public with sharing class XeroCallout {
    
    public String getConnections() {
     try {
        String accessToken = AuthUtil.getAccessToken();
        System.debug('Access Token: ' + accessToken);
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
            System.debug('Error in API request. Status Code: ' + res.getStatusCode());
            return null;
        }
     } catch (Exception e) {
        System.debug('Error getting access token: ' + e.getMessage());
        return null;
    }
    }

    public Map<String,Object> getProfitAndLoss(Date fromDate, Date toDate, Integer periods, String timeframe,
                                                    String trackingCategoryID, String trackingCategoryID2,
                                                    String trackingOptionID, String trackingOptionID2,
                                                    Boolean standardLayout, Boolean paymentsOnly) {
    try {
        String accessToken = AuthUtil.getAccessToken();
        XeroCallout xero = new XeroCallout();
        HttpRequest req = new HttpRequest();
        String tenantId = xero.getConnections();
        req.setMethod('GET');

        String params = 'fromDate=' + String.valueOf(fromDate) +
                        '&toDate=' + String.valueOf(toDate) +
                        '&periods=' + String.valueOf(periods) +
                        '&timeframe=' + timeframe +
                        '&trackingCategoryID=' + trackingCategoryID +
                        '&trackingCategoryID2=' + trackingCategoryID2 +
                        '&trackingOptionID=' + trackingOptionID +
                        '&trackingOptionID2=' + trackingOptionID2 +
                        '&standardLayout=' + String.valueOf(standardLayout) +
                        '&paymentsOnly=' + String.valueOf(paymentsOnly);

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
}
   
   /*
    public static Map<String, Object>  getBalanceSheet(Date date, Integer periods, 
                                                    String timeframe, String trackingOptionID1, 
                                                    String trackingOptionID2,
                                                    boolean standardLayout, boolean paymentsOnly) {
        
    String accessToken = AuthUtil.getAccessToken();
    
    HttpRequest req = new HttpRequest();
    req.setEndpoint('https://api.xero.com/api.xro/2.0/Reports/BalanceSheet');

    req.setHeader('Authorization', 'Bearer ' + accessToken);
    req.setHeader('xero-tenant-id', tenantId);
    req.setHeader('Content-Type', 'application/json');

    req.setParam('date', String.valueOf(date));
    req.setParam('periods', periods);
    req.setParam('timeframe', timeframe);
    req.setParam('trackingOptionID1', trackingOptionID1); 
    req.setParam('trackingOptionID2', trackingOptionID2);
    req.setParam('standardLayout', standardLayout);
    req.setParam('paymentsOnly', paymentsOnly);

    HttpResponse res = new Http().send(req);
    
    Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    System.debug('BalanceSheet report=' + responseBody);

    return responseBody;
}
*/