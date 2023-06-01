var option = {
    // related data information
    host: 'localhost',
    user: 'root',
    password: '1234',
    port: '3306',
    database: 'sessioninfo',

    // session expiration option
    ClearExpired : true,
    CheckExpirationInterval : 10000,
    Expiration : 1000 * 60 * 60 * 2
}

export default option;