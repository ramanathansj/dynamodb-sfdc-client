/**
 * @description       : simple sfdc client based on jsforce to post data
 * @author            : Ramanathan
 * @group             : 
 * @last modified on  : 09-18-2023
 * @last modified by  : Ramanathan
**/

import jsforce from 'jsforce'
import dotenv from "dotenv"
dotenv.config();

export default class SFConnect {
     authInfo = {};
    sfcon = null;

    async init() {
        //console.log("dotenv == %j", process.env); 
        this.authInfo = await this.authWithUsernamePassword();
        //console.log(`authinfo == ${JSON.stringify(this.authInfo)}`);
        this.sfcon = await this.getsfconnection();
        //console.log(`sfcon == ${this.sfcon}`);
    }

    async authWithUsernamePassword() {
        const sfConnection = new jsforce.Connection({
            loginUrl: process.env.SALESFORCE_LOGIN_URL
        });
        await sfConnection.login(
            process.env.SALESFORCE_USERNAME,
            process.env.SALESFORCE_PASSWORD+""+ process.env.SALESFORCE_TOKEN
        );
        return {
            accessToken: sfConnection.accessToken,
            instanceUrl: sfConnection.instanceUrl,
            organizationId: sfConnection.userInfo.organizationId
        }
    }

    async getsfconnection() {
        this.sfcon = new jsforce.Connection({
            instanceUrl : this.authInfo.instanceUrl,
            accessToken : this.authInfo.accessToken
          });
        return this.sfcon;
    }

    async postData( sobj, data) {
        try {
            console.log("inbound records = %j", data)
            let result = await this.sfcon.sobject(sobj).insert(data);
            console.log(`result == ${JSON.stringify(result)}`)
            return result;
        } catch (error) {
            console.log(`error == ${JSON.stringify(error)}`);
        }
    }

    async postDataHelper(obj, data) {
        await this.init();
        return await this.postData (obj, data);
    }
}

// let data = [{ Id : 'a01B000000FLsjnIAD', ERPOrderId__c : "testst"}];
// let sfdcconnect = new SFConnect();
// sfdcconnect.init();
//  let result = sfdcconnect.postDataHelper("Order__c", data);
// console.log(`result == ${JSON.stringify(result)}`);