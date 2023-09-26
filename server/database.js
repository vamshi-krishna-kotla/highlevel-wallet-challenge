// import required dependencies
const { v4 } = require('uuid');
const mysql = require('mysql');

// initialize process.env (environment variables) for database connection details
require('dotenv').config();

// database connection details, read from environment variables
const databaseConnectionDetails = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
};

// initialize a Promise instance to use for request race condition handling
let globalPromise = Promise.resolve();

// initialize database connection to communicate with the database
let database = mysql.createConnection(databaseConnectionDetails);

/**
 * @description
 * method to configure corresponding database query
 * execution and handlers for routes for UI to
 * communicate
 * 
 * @note every handler is executed after the `globalPromise` is
 * resolved and is updated for every handler sequentially to
 * deal with race conditions for multiple requests
 * 
 * @param {Object} app express server instance to configure routes and handlers
 * @param {Object} database mysql connection instance
 */
const setDatabaseRequestHandlers = (app, database) => {
    /**
     * @name POST/setup
     * 
     * @description
     * route to add new wallet details
     * - generate instance of new wallet details
     * - insert new wallet details into `wallets` table
     * - insert initial transaction details into `transactions` table
     */
    app.post('/setup', (req, res) => {
        globalPromise = globalPromise
            .then(() => {
                // check and proceed if walletName is present
                if (req.body && req.body.walletName) {
                    // generate Date instance for creation and initial transaction
                    const currentDate = new Date();

                    // generate new wallet details
                    const newWalletData = {
                        id: v4(),
                        name: req.body.walletName,
                        date: currentDate,
                        transaction_id: v4(),
                        balance: Number(parseFloat(req.body.transactionAmount).toFixed(4)),
                        description: req.body.transactionDescription
                    };

                    // insert new wallet details into `wallets` table
                    database.query(`
                        INSERT INTO wallets (id, name, balance, date)
                        VALUES ('${newWalletData.id}', '${newWalletData.name}', ${newWalletData.balance}, '${newWalletData.date.toISOString().slice(0, 19).replace('T', ' ')}');
                    `, (err, _) => {
                        if (err) {
                            // return internal server error if operation is failed
                            console.error(err);
                            res.status(500).end();
                        } else {
                            // insert transaction details into `transactions` table
                            database.query(`
                                INSERT INTO transactions (transaction_id, wallet_id, amount, balance, description, transaction_date)
                                VALUES ('${newWalletData.transaction_id}', '${newWalletData.id}', ${newWalletData.balance}, ${newWalletData.balance}, '${newWalletData.description}', '${newWalletData.date.toISOString().slice(0, 19).replace('T', ' ')}');
                            `, (err, _) => {
                                if (err) {
                                    // return internal server error if operation is failed
                                    console.error(err);
                                    res.status(500).end();
                                } else {
                                    // upon successful operation return 200 status with response
                                    res.status(200).send({
                                        id: newWalletData.id,
                                        balance: newWalletData.balance,
                                        transactionId: newWalletData.transaction_id,
                                        name: newWalletData.name,
                                        date: newWalletData.date
                                    }).end();
                                }
                            });
                        }
                    });
                } else {
                    // return 'BAD request' if walletName is not provided
                    res.status(400).end();
                }
            })
            .catch((err) => {
                // return internal server error if operation is failed
                console.error(err);
                res.status(500).end();
            });

        return globalPromise;
    });

    /**
     * @name POST/transact/:walletId
     * 
     * @description
     * route to add new transaction to existing wallet
     * - insert new transaction details into `transactions` table
     * - update the balance of given wallet
     */
    app.post('/transact/:walletId', (req, res) => {
        globalPromise = globalPromise
            .then(() => {
                // check and proceed if walletId is present
                if (req.params.walletId) {
                    // fetch wallet details of given walletId
                    database.query(`SELECT * FROM wallets WHERE id='${req.params.walletId}'`, (err, result) => {
                        if (err || !(result && result.length)) {
                            // return internal server error if operation is failed or no valid result is returned
                            console.error(err);
                            res.status(500).end();
                        } else {
                            // store the wallet details
                            const walletDetails = result.pop();

                            // generate new transaction details with updated balance
                            const newTransactionData = {
                                transaction_id: v4(),
                                wallet_id: req.params.walletId,
                                amount: req.body.amount,
                                description: req.body.description,
                                balance: Number(parseFloat(walletDetails.balance).toFixed(4)) + Number(parseFloat(req.body.amount).toFixed(4)),
                                transaction_date: new Date()
                            };

                            // insert transaction details into `transactions` table
                            database.query(`
                                INSERT INTO transactions (transaction_id, wallet_id, amount, balance, description, transaction_date)
                                VALUES ('${newTransactionData.transaction_id}', '${newTransactionData.wallet_id}', ${newTransactionData.amount}, ${newTransactionData.balance}, '${newTransactionData.description}', '${newTransactionData.transaction_date.toISOString().slice(0, 19).replace('T', ' ')}');
                            `, (err, _) => {
                                if (err) {
                                    // return internal server error if operation is failed
                                    console.error(err);
                                } else {
                                    // update the 'balance' value for given wallet
                                    database.query(`
                                        UPDATE wallets
                                        SET balance=${newTransactionData.balance}
                                        WHERE id='${newTransactionData.wallet_id}'
                                    `, (err, _) => {
                                        if (err) {
                                            // return internal server error if operation is failed
                                            console.error(err);
                                            res.status(500).end();
                                        } else {
                                            // upon successful completion of operation return data
                                            res.status(200).send({
                                                balance: newTransactionData.balance,
                                                transactionId: newTransactionData.transaction_id
                                            }).end();
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    // return 'BAD request' if walletId is not provided
                    res.status(400).end();
                }
            })
            .catch((err) => {
                // return internal server error if operation is failed
                console.error(err);
                res.status(500).end();
            });

        return globalPromise;
    });

    /**
     * @name GET/wallet/:id
     * 
     * @description
     * route to fetch existing wallet details
     * - read from `wallets` table where id matches requested id
     */
    app.get('/wallet/:id', (req, res) => {
        globalPromise = globalPromise
            .then(() => {
                // read from `wallets` table with requested id
                database.query(`
                    SELECT * FROM wallets
                    WHERE id='${req.params.id}'
                `, (err, result) => {
                    if (err) {
                        // return internal server error if operation is failed
                        console.error(err);
                        res.status(500).end();
                    } else {
                        if (result && result.length) {
                            // return details if user/wallet details found
                            res.status(200).send(result.pop()).end();
                        } else {
                            // if no data found then return 'NOT FOUND'
                            res.status(404).end();
                        }
                    }
                });
            })
            .catch((err) => {
                // return internal server error if operation is failed
                console.error(err);
                res.status(500).end();
            });

        return globalPromise;
    });

    /**
     * @name GET/transactions
     * 
     * @description
     * route to fetch available transactions for requested walletId
     * - read from `transactions` table where id matches requested id
     * - enable pagination to fetch and skip limited number of records
     */
    app.get('/transactions', (req, res) => {
        globalPromise = globalPromise
            .then(() => {
                // check and proceed if walletId is present
                if (req.query.walletId) {
                    // form query to fetch data
                    let fetchQuery = `SELECT * FROM transactions WHERE wallet_id='${req.query.walletId}'`;

                    if (req.query.sort) {
                        // add sorting details if requested
                        fetchQuery += ` ORDER BY ${req.query.sort}`;
                    } else {
                        // sort by transaction_date in descending order if no order is requested
                        fetchQuery += ' ORDER BY transaction_date DESC';
                    }

                    // add limitation of number of transactions to be fetched
                    if (req.query.limit) {
                        fetchQuery += ` LIMIT ${req.query.limit}`;
                    }
                    // add number of transactions to be skipped
                    if (req.query.skip) {
                        fetchQuery += ` OFFSET ${req.query.skip}`;
                    }

                    // fetch data from `transactions` table
                    database.query(fetchQuery, (err, records) => {
                        if (err) {
                            // return internal server error if operation is failed
                            console.error(err);
                            res.status(500).end();
                        } else {
                            // fetch total count of transactions available for requested walletId
                            database.query(`
                                SELECT COUNT(wallet_id) AS recordsCount FROM transactions
                                WHERE wallet_id='${req.query.walletId}'
                            `, (err, [countResult]) => {
                                if (err) {
                                    // return internal server error if operation is failed
                                    console.error(err);
                                    res.status(500).end();
                                } else {
                                    // return transactions and totalCount on successful completion
                                    res.status(200).send({ transactions: records, totalCount: countResult['recordsCount'] }).end();
                                }
                            });
                        }
                    });
                } else {
                    // return 'BAD request' if no walletId is given
                    res.status(400).end();
                }
            })
            .catch((err) => {
                // return internal server error if operation is failed
                console.error(err);
                res.status(500).end();
            });

        return globalPromise;
    });
};

/**
 * @description
 * method to initiate database connection and
 * set restarting on error event handler
 * 
 * @param {Object} app express server instance
 */
const initDatabaseConnection = (app) => {
    // connect to the database with given connection details
	database.connect((err) => {
		if (err) {
            // return internal server error if operation is failed
			console.error(err);
		} else {
			console.log('Database connected');

            // configure the server routes and handlers to given server instance
			setDatabaseRequestHandlers(app, database);

			// set the route to redirect any other path to home page
			app.get(/^((\/[a-z \-]*)?([\/])?)*$/i, (req, res) => {
				res.redirect('/');
			});
		}
	});

    database.on('error', () => {
        database = mysql.createConnection(databaseConnectionDetails);
        
        initDatabaseConnection(app, database);
    });
}

/**
 * @description
 * method to return a handler function to close
 * server and database connections
 * 
 * @param {Object} server express server instance
 * @param {Object} database mysql connection instance
 * @returns {Function} handler to close connections
 */
const serverCloseHandler = (server, database) => {
    return () => {
        console.log('Please wait while server is being closed......');
        server.close(() => {
            console.log('Server closed!');
            database.end();
            process.exit();
        });
    };
};

// export all required data
module.exports.setDatabaseRequestHandlers = setDatabaseRequestHandlers;
module.exports.initDatabaseConnection = initDatabaseConnection;
module.exports.database = database;
module.exports.serverCloseHandler = serverCloseHandler;
