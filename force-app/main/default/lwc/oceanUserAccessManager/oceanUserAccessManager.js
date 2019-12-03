
// import { getAppPOCs } from "@salesforce/apex/OceanUserAccessController.getAppPOCs";

class OceanUserAccessManager{
    constructor(userAppPOC){
        this.userObj = userAppPOC;
    }

    getApplicationsWithCreateAccess(){
        return [];
    }
}


export { OceanUserAccessManager }