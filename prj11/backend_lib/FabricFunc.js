export async function MintNFT(contract, ID, URI, username, col, row_num, null_ratio) {
    try{
        // make ctx
        const result = await contract.submitTransaction("MintWithTokenURI", ID, col, row_num, null_ratio, [], URI, username);
        
        return result;
    }
    catch (error){
        const result = {msg: `Mint Error ${error}`};
        return result;
    }
}

// 성공인지 실패인지만 return 하면 된다.
export async function MintIntegratedNFT(contract, ID, URI, username, col, row_num, null_ratio) {
    // make ctx
    const result = await contract.submitTransaction("MintWithTokenURI", ID, col, row_num, null_ratio, [], URI, username);

    return result;
}

export async function ShowMyNFT(contract, username) {
    const result = await contract.evaluateTransaction("BalancOf", username);
    
    return result;
}

export async function ShowAllNFT(contract) {
    const result = await contract.evaluateTransaction("TotalSupply");

    return result;
}

export async function GetTokenURI(contract, tokenID) {
    const URI = [];

    for await (const ID of tokenID){
        const uri = await contract.evaluateTransaction("TokenURI", ID);
        URI.push(uri);
    }

    return URI;
}