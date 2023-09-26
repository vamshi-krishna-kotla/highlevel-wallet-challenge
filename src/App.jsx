// import required dependencies
import React from 'react';
import { Route, Switch, Link } from 'react-router-dom';

// devextreme helper styles
import 'devextreme/dist/css/dx.light.css';

// global styles
import './App.scss';

import styles from './App.module.scss';

// import views
import Home from './views/home-page/Home.jsx';
import Transactions from './views/transactions/Transactions.jsx';

/**
 * @description
 * main component to be rendered on the page
 * this is the parent container for routing
 */
export default class App extends React.Component {
	constructor(props) {
		super(props);

		// initialize state with 'isWalletAvailable' placeholder
		this.state = {
			// flag to know if a wallet is available or not
			isWalletAvailable: false
		};
	}

	componentDidMount() {
		if (window.localStorage.getItem('walletId')) {
			this.setState({
				isWalletAvailable: true
			});
		}
	}

	render() {
		return (
			<div className={styles['application']}>
				{
					// use the 'isWalletAvailable' flag to render the links to add / view transactions
					this.state.isWalletAvailable
					?
					<div className={styles["links-container"]}>
						<Link
							to='/'
							className={styles['link'] + ' button'}
						>
							Wallet Details
						</Link>
						<Link
							to='/transaction-details'
							className={styles['link'] + ' button'}
						>
							Transaction History
						</Link>
					</div>
					:
					''
				}
				{/*
					display selective component/view based on the requested route
					using 'exact' for complete path match
				 */}
				<Switch>
					<Route path="/" exact>
						{/* pass prop to update state when new wallet is created */}
						<Home onWalletCreated={ () => this.setState({ isWalletAvailable: true }) }/>
					</Route>
					<Route path="/transaction-details" exact>
						<Transactions />
					</Route>
				</Switch>
			</div>
		);
	};
}
