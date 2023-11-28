public with sharing class AuthUtil {
    public static AuthProvider getAuthProvider() { 
        if (Schema.sObjectType.AuthProvider.isAccessible()) {
            return [SELECT Id, DeveloperName FROM AuthProvider WHERE DeveloperName='Xero'];
        } else {
            System.debug('User does not have access to AuthProvider.');
            return null;
        }
    }
    
    public static String getAccessToken() {

        AuthProvider authn = getAuthProvider();
        if (authn != null) {
            try {
                String providerName = 'Open ID Connect';
                String accessToken = Auth.AuthToken.getAccessToken(authn.Id, providerName);
                if (String.isEmpty(accessToken)) {
                    System.debug('Access token is empty.');
                }
                return accessToken;
            } catch (Exception e) {
                System.debug('Exception occurred while getting access token: ' + e.getMessage());
                return null;
            }
        } else {
            System.debug('AuthProvider is null.');
            return null;
        }
    }
}
