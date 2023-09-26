# highlevel-wallet-challenge

The project contains solution to the `HighLevel – Full Stack Dev Hiring Challenge 2`

## Tech Stack
- Frontend: [React](https://react.dev/) + [DevExtreme](https://js.devexpress.com/Documentation/Guide/React_Components/DevExtreme_React_Components/)
- Server: [Node](https://nodejs.org/en/) + [Express](https://expressjs.com/)
- Build Generation: [Webpack](https://webpack.js.org/)
- Database: [MySQL](https://www.mysql.com/)

The application is built on custom webpack configuration. The UI and API are hosted by the same server.

Access the application on: https://vamshi-highlevel-wallet-challenge.onrender.com/

## API endpoints info
### Data fetching
Route | Type | Description | Parameters | Payload Structure | Output Structure |
----- | ---- | ----------- | ---------- | ----------------- | ---------------- |
/setup | POST | Create new wallet. Requires the request body to have `balance` and `name` fields to initialize new wallet and sends the response of wallet details along with the first `transactionId` | - | { balance, name } | { id, balance, transactionId, name, date}
/transact/:walletId | POST | Perform a transaction on requested wallet with given amount. The transaction can be CREDIT (adds to balance) or DEBIT (removes from balance). Returns the response of updated balance and ID of the performed transaction | `walletId`: route parameter to specify the wallet | { amount, description } | { balance, transactionId }
/wallet/:id | GET | Fetch the details of requested wallet based on `id` parameter. Returns the `walletId`, current wallet `balance`, configured wallet `name` and creation `date` of the wallet | `id`: route parameter to specify the wallet | - | { id, balance, name , date } |
/transactions | GET | Fetch the list of transactions available for requested wallet. Transactions are fetched based on the requested limit (via `limit` and `skip` parameters) which work in correspondence to the pagination given in the display grid for the transactions. Sorting is enabled for the fields (handled by `sort` parameter in the query) which is also considered while fetching the transactions | parameters are attached in the query part of the request  ?walletId=`{walletId}`&skip=`{skip}`&limit=`{limit}`&sort=`{sortOrder}` | - | { id, walletId, amount, balance, description, date, type } |

### User Interface
Route | Type | Description | Parameters | Payload Structure | Output Structure |
----- | ---- | ----------- | ---------- | ----------------- | ---------------- |
/ | GET | This is the home route where the application UI is served. The application can be accessed from this route which works based on availability of a valid walletId | - | - | HTML content |
/transaction-details | GET | This route is accessible when a valid walletId exists and is used to view the available transactions for the wallet | - | - | HTML content |
/scripts/:file | GET | Fetch the required scripts from the server for the application features to start working | - | - | JavaScript file |
/*/** | GET | Any other route for the current application will be redirected to the home route `/` | - | - | **redirection** |

## Steps to setup
1. Clone the repo
2. Add a `.env` file with the required fields
    - DATABASE_HOST
    - DATABASE_PORT
    - DATABASE_USER
    - DATABASE_PASSWORD
    - DATABASE_NAME
3. Install all required modules `npm install`
4. There are 2 modes of running
    - To run the application in `Production` mode
        1. Generate the build `npm run build`
        2. Start the production server `npm run start`
        3. After the notification in the terminal visit the notified URL

        Nuances:
        1. Server-side rendered web pages
        2. Hashed styles

    - To run the application in `Development` mode
        1. Run the development server `npm run serve`
        2. After the notification in the terminal visit the notified URL

        Nuances:
        1. Dynamic webpack compilation
        2. Memory based build generation
