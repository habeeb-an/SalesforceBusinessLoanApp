public class AuthUtil {
    public static AuthProvider getAuthProvider() { 
        return [SELECT Id, DeveloperName FROM AuthProvider WHERE DeveloperName='Xero'];
    }
    
    public static String getAccessToken() {
        AuthProvider authn = getAuthProvider(); 
        System.debug('authn=>'+authn);
        return Auth.AuthToken.getAccessToken(authn.Id, authn.DeveloperName);
    }
}