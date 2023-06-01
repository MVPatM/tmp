import * as ipfs from 'ipfs-core' // downgrade version, so it may make error
import fs from 'fs';

export async function MakeNode (){
    const node = await ipfs.create();
    return node;
}

export async function StoretoIPFS(ipfs_node, fpath){
    try {
        const filecontent = fs.readFileSync(fpath);
        const fileadded = await ipfs_node.add(filecontent);
        console.log(fileadded);
        const filecid = fileadded.cid.toString();
        return filecid;
    }
    catch (error) {
        console.log("IPFS store error");
        return null;
    }
}

export async function GetFileFromIPFS(ipfs_node, file_cid){
    try{
        const file_stream = await ipfs_node.cat(file_cid);
        const file_chunks = [];

        for await (const chunk of file_stream){
            file_chunks.push(chunk);
        }
    
        return Buffer.concat(file_chunks);
    }
    catch (error){
        console.log("GetIPFS error");
        return null;
    }
}

export async function GetFilesFromIPFS(ipfs_node, file_cid){
    const files = [];

    for await (const cid of file_cid){
        const file_stream = await ipfs_node.cat(cid);
        const file_chunks = [];

        for await (const chunk of file_stream){
            file_chunks.push(chunk);
        }

        files.push(Buffer.concat(file_chunks));
    }

    return files;
    /*
    try{
        const files = [];

        for await (const cid of file_cid){
            const file_stream = await ipfs_node.cat(cid);
            const file_chunks = [];

            for await (const chunk of file_stream){
                file_chunks.push(chunk);
            }

            files.push(Buffer.concat(file_chunks))
        }

        return files;
    }
    catch (error){
        console.log("GetIPFS error");
        return null;
    }
    */
}