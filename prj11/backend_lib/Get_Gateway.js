// make to use require
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import {Gateway, Wallets} from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import path from 'path';
const fs = require('fs');
const {buildCAClient, registerAndEnrollUser, enrollAdmin} = require('../../test-application/javascript/CAUtil.js');
const {buildCCPOrg1, buildWallet} = require('../../test-application/javascript/AppUtil.js');
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'javascriptAppUser';

export async function GetGateway() {
    const ccp = buildCCPOrg1();
    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
    const wallet = await buildWallet(Wallets, walletPath);
    await enrollAdmin(caClient, wallet, mspOrg1);
    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
    const gateway = new Gateway();
    await gateway.connect(ccp, 
        {wallet, 
        identity: org1UserId, 
        discovery: {enabled: true, asLocalhost: true}});
    
    return gateway;
}
