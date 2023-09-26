// import required React based dependencies
import React from 'react';

// import required components and helpers from devextreme library
import TextBox from 'devextreme-react/text-box';
import Switch from 'devextreme-react/switch';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';

// import axios to work with http calls
import axios from 'axios';

// import module styles for home component
import styles from './Home.module.scss';

/**
 * @description
 * Home component is used to add new wallet or add transactions to existing wallet
 * - if a walletId exists, i.e., store in localStorage
 *  - details of the wallet are shown (id, name, balance, creation date)
 *  - new transactions (CREDIT/DEBIT) are allowed on the wallet
 * - else
 *  - new wallet can be added with name and initial balance
 * 
 * a link is available to view all transactions of the existing wallet
 */
export default class Home extends React.Component {
    constructor(props) {
		super(props);

        // initialize the state with required placeholders
        this.state = {
            // flag to know if wallet exists
            isWalletAvailable: false,

            // name of the existing wallet or input placeholder for new wallet name
            walletName: '',
            // balance of the existing wallet or input placeholder for balance of new wallet
            walletBalance: 0,
            // placeholder for existing wallet ID
            walletId: '',
            // creation date of the wallet
            walletCreationDate: null,

            // placeholder for transaction amount to add a new transaction
            transactionAmount: parseFloat(0).toFixed(4),
            // flag to describe if transaction is CREDIT (add to balance) or DEBIT (remove from balance)
            isCreditTransaction: true,
            // description for transaction to be performed
            transactionDescription: ''
        };

	}

    /**
     * when the component is mounted and ready to be used
     * - check if any wallet is configured
     * - if present then proceed with fetching the wallet details
     */
    componentDidMount() {
        // fetch ID from localStorage
        const walletId = window.localStorage.getItem('walletId');

        // if wallet exists then fetch wallet details
        if (walletId) {
            this.setWalletId(walletId);
        }
    }

    /**
     * @description
     * method to fetch the requested wallet details and update
     * the state to rerender the component
     * 
     * @param {String} walletId id fetched from localStorage
     */
    async setWalletId(walletId) {
        // fetch the wallet details from server and update the state
        try {
            // fetch the response from http call
            const { data, status } = await axios.get(`/wallet/${walletId}`);

            if (status === 200) {
                // set the state indicating the wallet details are available
                this.setState({
                    isWalletAvailable: true,
                    walletId,
                    walletName: data.name,
                    walletBalance: data.balance,
                    walletCreationDate: data.date
                });
            } else {
                // throw error if fetching fails
                throw new Error('Error fetching wallet details');
            }
        } catch (error) {
            // notify user if fetching fails
            notify('Error fetching wallet details! Please try again later!', 'error');
        }
    }

    /**
     * @description
     * handler method to set updated wallet name
     * 
     * @param {Object} event devextreme event object that holds updated data
     */
    updateWalletName = (event) => {
        this.setState({
            walletName: event.value
        });
    }

    /**
     * @description
     * handler method to toggle the 'isCreditTransaction' flag
     * based on user behavior
     * 
     * @param {Object} event devextreme event object that holds updated data
     */
    toggleIsCreditTransaction = (event) => {
        this.setState({
            isCreditTransaction: event.value
        });
    }

    /**
     * @description
     * handler method to set updated transaction description text
     * 
     * @param {Object} event devextreme event object that holds updated data
     */
    updateTransactionDescription = (event) => {
        this.setState({
            transactionDescription: event.value
        });
    }

    /**
     * @description
     * handler method to set updated transaction amount
     * @note transaction amount is taken in decimal format
     * with 4 decimal positions
     * 
     * @param {Object} event devextreme event object that holds updated data
     */
    updateTransactionAmount = (event) => {
        this.setState({
            transactionAmount: parseFloat(event.value).toFixed(4)
        });
    }

    /**
     * @description
     * method to validate the transaction amount, description
     * and adding new transaction into the wallet
     * 
     * @returns if any valid details are missing
     * then do not proceed with the transaction
     */
    addTransaction = async () => {
        try {
            // notify the user if any required details are missing to add new transaction
            if (!this.state.transactionAmount) {
                notify('Please add an amount for transaction!', 'warning');
                return;
            } else if (isNaN(this.state.transactionAmount)) {
                notify('Invalid value for amount! Please enter a valid number', 'error');
                return;
            } else if (!this.state.transactionDescription) {
                notify('Please add a description for transaction!', 'warning');
                return;
            }

            // http call to add new transaction to existing wallet
            const response = await axios.post(`/transact/${this.state.walletId}`, {
                // toggle the magnitude of transaction amount based on 'isCreditTransaction' flag
                amount: this.state.isCreditTransaction ? this.state.transactionAmount : -this.state.transactionAmount,
                description: this.state.transactionDescription
            });

            if (response && response.data && response.status === 200) {
                // once transaction is successfully added reload the user details to fetch latest balance
                this.setWalletId(this.state.walletId);
                notify('Successfully added new transaction!', 'success');
            } else {
                // throw error if adding transaction fails
                throw new Error('Error performing the transaction');
            }
        } catch (error) {
            // notify the user if adding transaction fails
            notify('Error performing the transaction! Please try again', 'error');
        } finally {
            // set the state to default values for next transaction
            this.setState({
                transactionAmount: parseFloat(0).toFixed(4),
                isCreditTransaction: true,
                transactionDescription: ''
            });
        }
    }

    /**
     * @description
     * method to receive input for name and initial balance
     * to create and store the new wallet
     * 
     * @returns if any valid details are missing
     * then do not proceed with the creation of wallet 
     */
    addNewWallet = async () => {
        try {
            // notify the user if any invalid input is given for transaction amount
            if (isNaN(this.state.transactionAmount)) {
                notify('Please enter a valid number for amount', 'error');
                return;
            }

            // http call to setup a new wallet with given name and balance
            const response = await axios.post('/setup', {
                walletName: this.state.walletName,
                transactionAmount: this.state.transactionAmount,
                transactionDescription: 'Wallet Setup'
            });

            if (response && response.data && response.status === 200) {
                // once the setup is successful add the walletId to localStorage
                window.localStorage.setItem('walletId', response.data.id);

                // set the state with new wallet details
                this.setState({
                    isWalletAvailable: true,
                    walletId: response.data.id,
                    walletName: response.data.name,
                    walletBalance: response.data.balance,
                    walletCreationDate: response.data.date,

                    transactionAmount: parseFloat(0).toFixed(4),
                    transactionDescription: ''
                });

                notify('New wallet set up successfully!', 'success');
            } else {
                // throw error if setup fails
                throw new Error('Error setting up new wallet');
            }
        } catch (error) {
            // notify the user if setup fails
            notify('Error setting up new wallet! Please try again later!', 'error');
        }
    }

    render() {
        return (
            <div id={styles['home-page-container']}>
                {
                    this.state.isWalletAvailable
                    ? 
                    // container to show wallet details
                    <div className={styles['wallet-details-and-transactions-container']}>
                        <div className={styles['wallet-details'] + ' dx-fieldset'}>
                            <h3 className={styles['wallet-details-title']}>Wallet Details</h3>
                            <div className='dx-field'>
                                <div className='dx-field-label'>Wallet ID</div>
                                <div className='dx-field-value'>{this.state.walletId}</div>
                            </div>
                            <div className='dx-field'>
                                <div className='dx-field-label'>Name</div>
                                <div className='dx-field-value'>{this.state.walletName}</div>
                            </div>
                            <div className='dx-field'>
                                <div className='dx-field-label'>Balance</div>
                                <div className='dx-field-value'>{this.state.walletBalance}</div>
                            </div>
                            <div className='dx-field'>
                                <div className='dx-field-label'>Wallet Created On</div>
                                <div className='dx-field-value'>{
                                    this.state.walletCreationDate
                                    ? new Date(this.state.walletCreationDate).toGMTString()
                                    : ''
                                }</div>
                            </div>
                        </div>
                        <div className={styles['transaction-input-container']}>
                            <h3 className={styles['transaction-input-title']}>New Transaction</h3>
                            <div className={styles['transaction-details'] + ' dx-fieldset'}>
                                <div className='dx-field'>
                                    <div className='dx-field-label'>Amount</div>
                                    <div className='dx-field-value'>
                                        <TextBox
                                            value={this.state.transactionAmount}
                                            onValueChanged={this.updateTransactionAmount}
                                            placeholder='Enter amount'
                                        />
                                    </div>
                                </div>
                                <div className='dx-field'>
                                    <div className='dx-field-label'>Transaction Type</div>
                                    <div className={styles['transaction-type-switch'] + ' dx-field-value'}>
                                        <Switch
                                            value={this.state.isCreditTransaction}
                                            onValueChanged={this.toggleIsCreditTransaction}
                                            switchedOnText='CREDIT'
                                            switchedOffText='DEBIT'
                                            width='7rem'
                                        />
                                    </div>
                                </div>
                                <div className='dx-field'>
                                    <div className='dx-field-label'>Description</div>
                                    <div className='dx-field-value'>
                                    <TextBox
                                        value={this.state.transactionDescription}
                                        onValueChanged={this.updateTransactionDescription}
                                        placeholder='Description for transaction'
                                    />
                                    </div>
                                </div>
                                <Button
                                    type='success'
                                    text='Add transaction'
                                    onClick={this.addTransaction}
                                />
                            </div>
                        </div>
                    </div>
                    :
                    // container to add new wallet
                    <div className={styles['register-wallet-container']}>
                        <h2 className={styles['register-wallet-title']}>Register New Wallet</h2>
                        <div className={styles['wallet-details'] + ' dx-fieldset'}>
                            <div className='dx-field'>
                                <div className='dx-field-label'>Wallet Name:</div>
                                <div className='dx-field-value'>
                                    <TextBox
                                        value={this.state.walletName}
                                        onValueChanged={this.updateWalletName}
                                        placeholder='Enter a name for the wallet'
                                    />
                                </div>
                            </div>
                            <div className='dx-field'>
                                <div className='dx-field-label'>Initial Balance:</div>
                                <div className='dx-field-value'>
                                    <TextBox
                                        value={this.state.transactionAmount}
                                        onValueChanged={this.updateTransactionAmount}
                                        placeholder='Enter amount'
                                    />
                                </div>
                            </div>
                            <Button
                                text='Add Wallet'
                                type='success'
                                onClick={this.addNewWallet}
                            />
                        </div>
                    </div>
                }
            </div>
        );
    }
}
