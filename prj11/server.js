// make to use require
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// get the module to need
import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import db from './backend_lib/db_option.js';
import session_option from './backend_lib/session_option.js';
import bcrypt from 'bcrypt';
import * as func from './backend_lib/FabricFunc.js';
import * as addition from './backend_lib/additional_lib.js';
import csv from 'csv-parser';
import multer from 'multer';
import url from 'url';
const csvWriter = require('fast-csv');
const cors = require('cors');
import * as gate from './backend_lib/Get_Gateway.js';

// initial setting
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // make security problem?
    }
})
const app = express();
const port = 3001;
const upload = multer({storage: storage});
let mint_num = 0;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let node, gateway, network, contract;
const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME || 'token_erc721';

// make the file access to client under directory 'current folder pos + /build'
app.use(express.static(path.join(__dirname, '/client/build')));
app.all(cors({
    origin: '',
    credentials: true
}));

// make post.req.body's data interpret
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// session setting
const mysql_storage = require('express-mysql-session')(session);
const session_storage = new mysql_storage(session_option);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: session_storage,
    resave: false,
    saveUninitialized: false
}));

// the middleware allows to start server using port 3000
app.listen(port, async () => {
    node = await addition.MakeNode();
    gateway = await gate.GetGateway();
    network = await gateway.getNetwork(channelName)
    contract = network.getContract(chaincodeName)
    await contract.submitTransaction("Initialize", "dataNFT");
    console.log('Listening Client Application')
});

// the middleware is executed when there is a get request with '/' path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build/index.html'))
});

app.get('/login', (req, res) => {
    console.log("loginpage")
    res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

// login process
app.post('/login/login', (req, res) => {
    const username = req.body.userId;
    const password = req.body.password;
    const send_data = {loginSuccess: ""};
    console.log("login process");

    if (username && password){
        db.query('SELECT * FROM usertable WHERE username = ?', [username], function (error, results,fields){
            if (error)
                throw error
            if (results.length > 0){
                bcrypt.compare(password, results[0].userchn, (err, result) => {
                    if (result == true){
                        req.session.is_logined = true;
                        req.session.nickname = username;
                        req.session.save(function () {
                            send_data.loginSuccess = true;
                            res.send(send_data);
                        })
                    }
                    else {
                        send_data.msg = "not correct login information"
                        res.send(send_data)
                    }
                })
            }
            else {
                send_data.msg = "error for id or password"
                res.send(send_data)
            }
        })
    }
    else { // don't input about id or password information
        send_data.msg = "input ID or password"
        res.send(send_data)
    }
});

// signup process
app.post('/login/signup', (req, res) => {
    const username = req.body.userId;
    const password = req.body.password;
    const phonenumber = req.body.phoneNumber;
    const send_data = {msg:""};
    console.log("signup process");

    if (username && password && phonenumber){
        db.query("SELECT * FROM usertable WHERE username = ?", [username], function(error, results, fields){
            if (error)
                throw error;
            if (results.length <= 0){
                const hashedpassword = bcrypt.hashSync(password, 10);
                db.query("INSERT INTO usertable (username, userchn, phonenum) VALUES(?,?,?)", [username, hashedpassword, phonenumber], function (error, data){
                    if (error)
                        throw error;
                    req.session.save(function () {
                        send_data.msg = "SignUp success";
                        res.send(send_data);
                    })
                })
            }
            else {
                send_data.msg = "already exist the id";
                res.send(send_data);
            }
        })
    }
    else {
        send_data.msg = "check the input"
        res.send(send_data)
    }
});

// the process to mint the nft
app.post('/mintNFT/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    const username = req.session.nickname;
    const send_data = {ismintsuccess: "", msg:"", nft: ""};
    console.log("mint process");

    if (file){
        // check the csv file and must make the module
        if (path.extname(file.originalname) != '.csv'){
            console.log("ext failure")
            fs.unlinkSync(file.path);
            send_data.ismintsuccess = false;
            send_data.msg = "You don't load the file or can load only csv file";
            res.send(send_data);
        }
        else {
            // get the metadata
            let rowCount = 0;
            let nullCount = 0;
            let columnCount = 0;
            let column = [];
            let uri;
    
            fs.createReadStream(file.path, "utf-8")
            .pipe(csv())
            .on('headers', (headers) => {
                columnCount = headers.length;
                column.push(headers);
            })
            .on('data', () => {
                rowCount++;
            })
            .on('data', (row) => {
                Object.values(row).forEach((value) => {
                    if (value === null || value === ''){
                        nullCount++;
                    }
                })
            })
            .on('end', async () => {
                uri = await addition.StoretoIPFS(node, file.path);
                console.log(`column: ${column}, columncount: ${columnCount} row: ${rowCount}, null: ${nullCount}`);
                const null_ratio = nullCount / (columnCount * rowCount)
                fs.unlinkSync(file.path); // delete the file stored in server
                const result = await func.MintNFT(contract, string(mint_num++), uri, username, column, rowCount, null_ratio);
                const tmp = JSON.parse(result.toString('utf8'));
                send_data.ismintsuccess = true;
                send_data.msg = "mint success";
                //send_data.nft = {tokenId: mint_num, metaData: {columns: column, dataSize: rowCount, nullRatio: null_ratio}, tokenURI: uri};
                send_data.nft = tmp;
                res.send(send_data);
            })
        }    
    }
    else{
        console.log("failure")
        send_data.ismintsuccess = false;
        send_data.msg = "you need to upload the file"
        res.send(send_data);
    }
});

// if use sql query, user the next sql cmd
// select uid from usertable where username = ?, [username]
// the process to show nfts owned by user
app.get('/myNFT', async (req, res) => {
    const username = req.session.nickname;
    const send_data = {nfts: ""};
    console.log(`session name ${username}`);
    console.log("show my NFT");

    // get the data
    //const result = await func.ShowMyNFT(contract, username); // maybe array
    //send_data.nfts = result;
    send_data.nfts = [{tokenId: 5, metaData:{columns: ['kim', 'han'], dataSize: 10 ,nullRatio: 0.1}, tokenURI: "ads"}, {tokenId: 10, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.25}, tokenURI: "knk"}];
    res.send(send_data);
});

// show the entire of nft to search
app.get('/searchNFT', async(req, res) => {
    const username = req.session.nickname;
    const send_data = {nfts: ""};
    console.log("searchNFT Process")

    // get the data
    //const result = await func.ShowAllNFT(contract); // maybe array
    //send_data.nfts = result;
    send_data.nfts = [{tokenId: 5, metaData:{columns: ['kim', 'han'], dataSize: 10 ,nullRatio: 0.1}, tokenURI: "ads"}, {tokenId: 10, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.25}, tokenURI: "knk"},  {tokenId: 15, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.79}, tokenURI: "knk"},  {tokenId: 16, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.11}, tokenURI: "knk"},  {tokenId: 17, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.23}, tokenURI: "knk"},  {tokenId: 18, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.37}, tokenURI: "knk"},  {tokenId: 19, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.36}, tokenURI: "knk"},  {tokenId: 20, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.31}, tokenURI: "knk"},  {tokenId: 21, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.27}, tokenURI: "knk"},  {tokenId: 22, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.5}, tokenURI: "knk"},  {tokenId: 23, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.4}, tokenURI: "knk"},  {tokenId: 24, metaData: {columns: ['song', 'lee'], dataSize: 8, nullRatio:0.3}, tokenURI: "knk"}];
    res.send(send_data);
});

// send the selected files
app.post('/searchNFT/search', async(req, res) => {
    const selected_tokenId = req.body.tokenId;
    const selected_tokenURI = req.body.tokenURI; // maybe array
    console.log("send selected searchNFT Process")
    let send_data = {file: ""};

    const file = await addition.GetFileFromIPFS(node, selected_tokenURI);
    fs.writeFileSync(`tmp/${selected_tokenId}.csv`, file);
    res.sendFile(`tmp/${selected_tokenId}.csv`);
});

// show the entire of nft to integrate
app.get('/integrateNFT', async (req, res) => {
    const send_data = {nfts: ""};
    const username = req.session.nickname;
    console.log("Show All of NFT to integrate NFT")

    //const result = await func.ShowAllNFT(contract); // maybe array
    //send_data.nfts = result;
    send_data.nfts = [{tokenId: 0, metaData:{columns: ['id', 'grade', 'age', 'class'], dataSize: 4 ,nullRatio: 0.625}, tokenURI: "QmZiAYfaNYQSFU85rA5Q2Ht75dpSKBiN3GFUorV1LtgV7L"}, {tokenId: 1, metaData: {columns: ['id', 'grade', 'age', 'class'], dataSize: 5, nullRatio:0.6}, tokenURI: "QmWKkWSVzwc7CJhCH4XF5HTfdhKZd4am4SAwhRvft2DwWH"}];
    res.send(send_data);
})

// the process to integrate individual NFT
app.post('/integrateNFT/mint', async (req, res) => {
    let selected_tokenURI = req.body.tokenURI;
    let selected_tokenId = req.body.tokenId;
    const username = req.session.nickname;
    let send_data = {nft: "", msg: "", isSuccess: ""};
    let integrate_count = mint_num++;
    console.log("Integrate Process");

    //let selected_uri = await func.GetTokenURI(contract, selected_tokenId);

    // get the file to integrate from ipfs
    let files = await addition.GetFilesFromIPFS(node, selected_tokenURI);
    let file_count = 0;

    // write the file in server
    fs.mkdirSync(`Integrate${integrate_count}`);
    for await (const file of files) {
        const filepath = `Integrate${integrate_count}/${file_count}.csv`;
        file_count++;
        fs.writeFileSync(filepath, file);
    }

    // concatenate csvfile
    const concat_filepath = `Integrate${integrate_count}/0.csv`;
    let mergedData = [];
    
    await new Promise ((resolve, reject) => {
        for (let i = 0; i < file_count; i++){
            fs.createReadStream(`Integrate${integrate_count}/${i}.csv`)
            .pipe(csv())
            .on('data', (data) => {
                mergedData.push(data);
            })
            .on('end', async () => {
                fs.writeFileSync(concat_filepath, '');
                csvWriter.writeToPath(concat_filepath, mergedData, { headers: true })
                .on('finish', () => {
                    resolve();
                })
            });
        }
    })

    // delete the used file
    for (let i = 1; i < file_count; i++){
        fs.unlinkSync(`Integrate${integrate_count}/${i}.csv`);
    }

    // calculate the metadata of concatenated csvfile
    try{
        let rowCount = 0;
        let nullCount = 0;
        let columnCount = 0;
        let column = [];
        let uri;

        await new Promise (() => {
            fs.createReadStream(concat_filepath)
            .pipe(csv())
            .on('headers', (headers) => {
                columnCount = headers.length;
                column.push(headers);
            })
            .on('data', () => {
                rowCount++; 
            })
            .on('data', (row) => {
                Object.values(row).forEach((value) => {
                    if (value === null || value === ''){
                        nullCount++;
                    }
                });
            })
            .on('end', async () => {
                uri = await addition.StoretoIPFS(node, concat_filepath);
                fs.unlinkSync(concat_filepath); // delete the file stored in server
                fs.rmdirSync(`Integrate${integrate_count}`);
                const null_ratio = nullCount / (columnCount * rowCount);
                const result = await func.MintIntegratedNFT(contract, string(integrate_count), uri, username, column, rowCount, null_ratio);
                send_data.isSuccess = true;
                const tmp = JSON.parse(result.toString('utf8'));
                send_data.nft = tmp;
                //send_data.nft = {tokenId: integrate_count, metaData: {columns: column, dataSize: rowCount, nullRatio: null_ratio}, tokenURI: uri};
                res.send(send_data);
            })
        })
    }
    catch (error){
        send_data.isSuccess = false;
        send_data.msg = "Integrate Mint ERROR";
        res.send(send_data);
    }
});

// program exits
process.on('SIGINT', async() => {
    //await gateway.disconnect();
    await node.stop();
    console.log("program exits");
    process.exit(0);
})