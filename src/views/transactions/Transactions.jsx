// import required React based dependencies
import React from 'react';

// import axios to work with http calls
import axios from 'axios';

// import required components and helpers from devextreme library
import notify from 'devextreme/ui/notify';
import DataGrid, {
        Export,
        Pager,
        Paging,
        RemoteOperations,
        Sorting
    } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { exportDataGrid } from 'devextreme/excel_exporter';

// import dependencies to generate CSV file
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// import module styles for transactions component
import styles from './Transactions.module.scss';

/**
 * @description
 * Transactions component is used to display all available
 * transactions of current wallet
 * 
 * transactions grid is enabled with sorting, pagination
 * and export to CSV
 */
export default class Transactions extends React.Component {
    // list of columns and respective fields for grid
    columns = [{
        caption: 'Transaction ID',
        dataField: 'transaction_id',
        dataType: 'string',
        width: '25%'
    }, {
        caption: 'Transaction Amount',
        dataField: 'amount',
        dataType: 'number'
    }, {
        caption: 'Balance (after transaction)',
        dataField: 'balance',
        dataType: 'number'
    }, {
        caption: 'Description',
        dataField: 'description',
        dataType: 'string'
    }, {
        caption: 'Type',
        dataType: 'string',
        width: '10%',
        calculateCellValue: ({ amount }) => {
            return (amount < 0) ? 'DEBIT' : 'CREDIT';
        }
    }, {
        caption: 'Transaction Date',
        dataField: 'transaction_date',
        dataType: 'date',
        calculateCellValue: ({ transaction_date }) => {
            return (new Date(transaction_date)).toGMTString();
        }
    }];

    // list of available pagination size options
    allowedPageSizes = [5, 10, 15];

    // devextreme custom data store to work dynamically with list of transactions
    transactionsDataSource = new CustomStore({
        key: 'transaction_id',
        /**
         * @description
         * method to fetch the data to be displayed on the transactions grid
         * - fetches the requested number of transactions
         * - includes sorting functionality
         * 
         * @param {Object} loadOptions config options to fetch transactions list
         * @returns {Promise} a promise that resolves the totalCount and list of transactions
         */
        load: (loadOptions) => {
            /**
             * use loadOptions to fetch required amount of data
             */
            if (this.state.walletId) {
                // if a walletId exists then fetch the list of transactions from the server
                return axios.get('/transactions', {
                    // send the required query parameters
                    params: {
                        // requested walletId
                        walletId: this.state.walletId,
                        // number of transactions to skip
                        skip: loadOptions.skip,
                        // number of transactions to fetch
                        limit: loadOptions.take,
                        // sort order if required on the grid
                        sort: loadOptions.sort ? this.prepareSortOrder(loadOptions.sort) : null
                    }
                })
                    .then(response => {
                        if (response.data && response.status === 200) {
                            // return the fetched list of transactions and totalCount on successful completion
                            return {
                                data: response.data.transactions,
                                totalCount: response.data.totalCount
                            };
                        } else {
                            // throw error if fetching fails
                            throw new Error('Error fetching transaction history');
                        }
                    })
                    .catch((err) => {
                        // notify user about the failure in fetching and return empty response
                        notify('Error fetching transaction history! Please try again later!', 'error');

                        return {
                            data: [],
                            totalCount: 0
                        };
                    });
            } else {
                // return empty response if there is no walletId
                return Promise.resolve()
                    .then(() => ({
                        data: [],
                        totalCount: 0
                    }));
            }
        }
    });

    constructor(props) {
		super(props);

        // initialize the state with required placeholders
        this.state = {
            // flag to know if wallet exists
            isWalletAvailable: false,

            // placeholder for existing wallet ID
            walletId: ''
        };
	}

    /**
     * @description
     * initial method when component is ready on the DOM
     * - fetch walletId from localStorage
     * - display wallet details if walletId is found
     * - display input boxes to add new wallet if no walletId is found
     */
    componentDidMount() {
        // fetch ID from localStorage
        const walletId = window.localStorage.getItem('walletId');

        // if user exists then fetch user details
        if (walletId) {
            this.setWalletId(walletId);
        }
    }

    /**
     * @description
     * method to fetch and update the component with wallet details
     * if a walletId is found in localStorage
     * 
     * @param {String} walletId id read from localStorage regarding saved wallet
     */
    setWalletId(walletId) {
        this.setState({
            isWalletAvailable: true,
            walletId
        });
    }

    /**
     * @description
     * export event handler to read from the grid
     * and prepare a CSV file of available transactions
     * 
     * @param {Object} event devextreme export event object
     */
    onTransactionsExporting(event) {
        // initialize new workbook and add a sheet into it
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        /*
            trigger the export method to prepare CSV file from the
            component and write into the worksheet prepared above
        */
        exportDataGrid({
            component: event.component,
            worksheet
        }).then(() => {
          workbook.csv.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Transactions.csv");
          });
        });

        // cancel the event execution further as exporting is done
        event.cancel = true;
    }

    /**
     * @description
     * method to prepare the sort order string to be sent
     * to the server to fetch the transactions in requested order
     * 
     * @param {Array} sortList list of fields and sort direction on which sorting is enabled
     * @returns {String} prepared sort order to fetch the data from the server
     */
    prepareSortOrder(sortList) {
        const sortListUpdated = sortList.map(field => {
            return `${field.selector} ${field.desc ? 'desc' : 'asc'}`;
        });

        return sortListUpdated.join(', ');
    }

    render() {
        return (
            <div id={styles['transactions-page-container']}>
                {/*
                    transactions grid built with devextreme DataGrid component
                */}
                <div className={styles['transactions-grid-container']}>
                    <DataGrid
                        dataSource={this.transactionsDataSource}
                        keyExpr="transaction_id"
                        showBorders={true}
                        allowColumnReordering={true}
                        allowColumnResizing={true}
                        columns={this.columns}
                        onExporting={this.onTransactionsExporting}
                    >
                        <Sorting mode="multiple" />
                        <RemoteOperations groupPaging={true} />
                        <Paging defaultPageSize={5} />
                        <Pager
                            visible={true}
                            showInfo={true}
                            showPageSizeSelector={true}
                            allowedPageSizes={this.allowedPageSizes}
                            showNavigationButtons={true}
                        />
                        <Export enabled={true} />
                    </DataGrid>
                    <p className={styles['grid-disclaimer']}>
                        Note: Click on any column header for sorting. Double Click for more options
                    </p>
                </div>
            </div>
        );
    }
}
