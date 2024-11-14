// Global Variables
let web3;
let contract;
let userAccount;
const contractAddress = '0x1F9dC015b3dd55ED208731ED4a9c1F654E542BcC'; // Replace with your deployed contract address
const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "txId",
				"type": "bytes32"
			}
		],
		"name": "AlreadyQueuedError",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_txId",
				"type": "bytes32"
			}
		],
		"name": "cancel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_txId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "_newTarget",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_newTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_newAmount",
				"type": "uint256"
			}
		],
		"name": "modify",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NotOwnerError",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "txId",
				"type": "bytes32"
			}
		],
		"name": "NotQueuedError",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_target",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "queue",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "blockTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiresAt",
				"type": "uint256"
			}
		],
		"name": "TimestampExpiredError",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "blockTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TimestampNotInRangeError",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "blockTimestmap",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TimestampNotPassedError",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TxFailedError",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "txId",
				"type": "bytes32"
			}
		],
		"name": "Cancel",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_requestId",
				"type": "uint256"
			}
		],
		"name": "cancelRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_suggestedTime",
				"type": "uint256"
			}
		],
		"name": "createRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_txId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_latestTime",
				"type": "uint256"
			}
		],
		"name": "execute",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "txId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Execute",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "txId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Queue",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "RequestCanceled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestNo",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "requestor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RequestSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "txId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "newTarget",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newTimestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TransactionModified",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "getCurrentTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFutureTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transactionId",
				"type": "bytes32"
			}
		],
		"name": "getTransferDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "unlockTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "status",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			}
		],
		"name": "getTransfersByRecipient",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			}
		],
		"name": "getTransfersByStatus",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			},
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			}
		],
		"name": "getTransfersByStatusAndRecipient",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "startIndex",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endIndex",
				"type": "uint256"
			}
		],
		"name": "getTransfersByStatusPaginated",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_target",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "nonce",
				"type": "uint256"
			}
		],
		"name": "getTxId",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "GRACE_PERIOD",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "iterateRequests",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "studentAddresses",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "timestamps",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			},
			{
				"internalType": "bool[]",
				"name": "activeStatuses",
				"type": "bool[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "iterateTransactions",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "_keys",
				"type": "bytes32[]"
			},
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "timestamps",
				"type": "uint256[]"
			},
			{
				"internalType": "uint8[]",
				"name": "queuedStatuses",
				"type": "uint8[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "keys",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_DELAY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_DELAY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "nonces",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "queued",
		"outputs": [
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "requestIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "studentRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Constants matching Solidity contract
const MIN_DELAY = 10; // seconds
const MAX_DELAY = 864000; // seconds (10 days)

// Event Listeners for page load and MetaMask connection
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(abi, contractAddress);
    } else {
        alert('Please install MetaMask to use this dApp!');
        return;
    }

    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', connectToMetaMask);
    }

    const scheduleButton = document.getElementById('scheduleButton');
    if (scheduleButton) {
        scheduleButton.addEventListener('click', scheduleTransfer);
    }

    displayCurrentTime();
    setInterval(displayCurrentTime, 1000); // Update time every second

	setInterval(updateClaimFundsTable, 20000); // Update every 10 seconds

    // Event listeners for Solidity events
	contract.events.Queue({
		fromBlock: 'latest'
	}, function (error, event) {
		if (!error) {
			console.log("Queue event detected:", event);
			updateClaimFundsTable(); // Call the update function after a new transfer is queued
		} else {
			console.error("Error in Queue event listener:", error);
		}
	});
	
	contract.events.Execute({
		fromBlock: 'latest'
	}, function (error, event) {
		if (!error) {
			console.log("Execute event detected:", event);
			updateClaimFundsTable(); // Call the update function after a transfer is executed
		} else {
			console.error("Error in Execute event listener:", error);
		}
	});
	
	contract.events.Cancel({
		fromBlock: 'latest'
	}, function (error, event) {
		if (!error) {
			console.log("Cancel event detected:", event);
			updateClaimFundsTable(); // Call the update function after a transfer is canceled
		} else {
			console.error("Error in Cancel event listener:", error);
		}
	});
	
});

// Function to display the current time
function displayCurrentTime() {
    const now = Math.floor(Date.now() / 1000);  // Time in seconds
    document.getElementById('currentTime').innerText = new Date(now * 1000).toLocaleString(); // Formatting for display
}

// Function to connect to MetaMask
async function connectToMetaMask() {
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];

        // Display user account information
        document.getElementById('accountInfo').style.display = 'block';
        document.getElementById('userAddress').innerText = userAccount;

        // Fetch and display user's ETH balance
        const balance = await web3.eth.getBalance(userAccount);
        document.getElementById('balance').innerText = web3.utils.fromWei(balance, 'ether') + ' ETH';

        // Show the scheduling and claim funds sections
        document.getElementById('scheduleSection').style.display = 'block';
        document.getElementById('claimFundsSection').style.display = 'block';
        document.getElementById('filterSection').style.display = 'block';

        // Verify if the user is the contract owner
        const contractOwner = await contract.methods.owner().call();
        console.log('userAccount:', userAccount);
        console.log('contractOwner:', contractOwner);

        // After connecting to MetaMask, directly load the table data
        updateClaimFundsTable();  // Call this to update the table immediately after connection

    } catch (error) {
        console.error('Failed to connect to MetaMask:', error.message);
        alert('Failed to connect to MetaMask');
    }
}

ethereum.on('accountsChanged', function (accounts) {
    if (accounts.length > 0) {
        // Update account info and balance
        userAccount = accounts[0];
        document.getElementById('userAddress').innerText = userAccount;
        web3.eth.getBalance(userAccount).then(balance => {
            document.getElementById('balance').innerText = web3.utils.fromWei(balance, 'ether') + ' ETH';
        });
    }
});


// (This based on the solidity)
// Function to schedule a transfer and display it directly in the table
async function scheduleTransfer() {
    const recipientAddress = document.getElementById('scheduleRecipientAddress').value.trim();
    const amount = document.getElementById('scheduleAmount').value.trim();
    const unlockTimeLocal = document.getElementById('scheduleUnlockTime').value;

    if (!web3.utils.isAddress(recipientAddress)) {
        alert('Invalid recipient address.');
        return;
    }

    const unlockTime = Math.floor(new Date(unlockTimeLocal).getTime() / 1000); // Time in seconds
    const amountInWei = web3.utils.toWei(amount, 'ether');

    try {
        const latestBlock = await web3.eth.getBlock('latest');
        const currentTimestamp = Number(latestBlock.timestamp);

        const minUnlockTime = currentTimestamp + MIN_DELAY;
        const maxUnlockTime = currentTimestamp + MAX_DELAY;

        if (unlockTime < minUnlockTime || unlockTime > maxUnlockTime) {
            alert(`Unlock time must be between ${new Date(minUnlockTime * 1000).toLocaleString()} and ${new Date(maxUnlockTime * 1000).toLocaleString()}.`);
            return;
        }

        // Estimate gas for the queue function
        const gasEstimate = await contract.methods.queue(recipientAddress, unlockTime, amountInWei).estimateGas({
            from: userAccount,
            value: amountInWei
        });

        // Send the transaction and schedule the transfer
        const receipt = await contract.methods.queue(recipientAddress, unlockTime, amountInWei).send({
            from: userAccount,
            value: amountInWei,
            gas: gasEstimate
        });

        console.log(`Transaction scheduled: ${receipt.events.Queue.returnValues.txId}`);
        
        // Directly display the newly scheduled transaction in the table
        const txId = receipt.events.Queue.returnValues.txId;
        displayScheduledTransaction(txId, recipientAddress, amountInWei, unlockTime);

        alert('Transfer successfully scheduled!');

    } catch (error) {
        console.error("Error scheduling transfer:", error.message);
        alert(`Error scheduling transfer: ${error.message}`);
    }
}

// Function to display the newly scheduled transaction
function displayScheduledTransaction(txId, recipientAddress, amountInWei, unlockTime) {
    const tableBody = document.querySelector('#claimFundsTableBody');

    // Create the recipient display text
    const recipientDisplay = (recipientAddress.toLowerCase() === userAccount.toLowerCase()) ? 'You' : recipientAddress;

    // Create table row
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${userAccount}</td>
        <td>${recipientDisplay}</td>
        <td>${new Date().toLocaleString()}</td>
        <td>${new Date(unlockTime * 1000).toLocaleString()}</td>
        <td>${web3.utils.fromWei(amountInWei, 'ether')}</td>
        <td>Queued</td>
        <td><button disabled>Withdraw</button></td>
        <td><button onclick="cancelTransaction('${txId}')">Cancel</button></td>
    `;

    // Append the new row to the table
    tableBody.appendChild(row);
}

// Function to cancel a transaction (simplified for demonstration)
async function cancelTransaction(txId) {
    try {
        await contract.methods.cancel(txId).send({
            from: userAccount,
            gas: 5000000  // Adjust gas limit if needed
        });
        alert(`Transaction ${txId} canceled successfully.`);
        updateClaimFundsTable();  // Refresh the table after cancellation
    } catch (error) {
        console.error("Cancellation Error:", error.message);
        alert(`Cancellation failed: ${error.message}`);
    }
}

// Function to modify a transaction
async function modifyTransaction(txId) {
    const newTarget = prompt("Enter new target address:");
    const newTimestamp = prompt("Enter new unlock timestamp (in UNIX time):");
    const newAmount = prompt("Enter new amount (ETH):");
    const newAmountInWei = web3.utils.toWei(newAmount, 'ether');

    try {
        // Estimate gas for the modify function
        const gasEstimate = await contract.methods.modify(txId, newTarget, newTimestamp, newAmountInWei).estimateGas({
            from: userAccount,
            value: newAmountInWei // Only necessary if the amount increases
        });

        // Send the modify transaction
        await contract.methods.modify(txId, newTarget, newTimestamp, newAmountInWei).send({
            from: userAccount,
            value: newAmountInWei,  // If you're modifying to a higher amount
            gas: gasEstimate
        });

        alert(`Transaction ${txId} modified successfully.`);
        updateClaimFundsTable();  // Refresh the table after modification
    } catch (error) {
        console.error("Modification Error:", error.message);
        alert(`Modification failed: ${error.message}`);
    }
}

// Function to update the table and remove the "Create Time"
async function updateClaimFundsTable() {
    const tableBody = document.querySelector('#claimFundsTableBody');
    tableBody.innerHTML = ''; // Clear the table

    try {
        const { _keys, targets, values, timestamps, queuedStatuses } = await contract.methods.iterateTransactions().call();

		for (let i = 0; i < _keys.length; i++) {
			let statusLabel = '';
			switch (Number(queuedStatuses[i])) {
				case 1: statusLabel = 'Queued'; break;
				case 2: statusLabel = 'Executed'; break;
				case 3: statusLabel = 'Cancelled'; break;
				default: statusLabel = 'Unknown';
			}
		
			const recipientAddress = (targets[i].toLowerCase() === userAccount.toLowerCase()) ? 'You' : targets[i];
			const unlockTime = Number(timestamps[i]);
			const formattedAmount = web3.utils.fromWei(values[i].toString(), 'ether'); // Convert BigInt to string for web3
		
			// Disable buttons if the transaction is cancelled
			const modifyButtonDisabled = statusLabel === 'Cancelled' ? 'disabled' : '';
			const cancelButtonDisabled = statusLabel === 'Cancelled' ? 'disabled' : '';
		
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${userAccount}</td>
				<td>${recipientAddress}</td>
				<td>${new Date(unlockTime * 1000).toLocaleString()}</td>
				<td>${formattedAmount}</td>
				<td>${statusLabel}</td>
				<td><button ${modifyButtonDisabled} onclick="modifyTransaction('${_keys[i]}')">Modify</button></td>
				<td><button ${cancelButtonDisabled} onclick="cancelTransaction('${_keys[i]}')">Cancel</button></td>
			`;
			tableBody.appendChild(row);
		}
    } catch (error) {
        console.error("Error updating claim funds table:", error.message);
    }
}

// Function to claim funds (withdraw)
async function withdrawFunds(txId) {
    try {
        const latestBlock = await web3.eth.getBlock('latest');  // Get the latest block
        const latestTime = latestBlock.timestamp;  // Use the block timestamp

        // Execute the withdrawal on the blockchain
        await contract.methods.execute(txId, latestTime).send({
            from: userAccount,
            gas: 5000000  // Adjust gas limit if needed
        });

        updateClaimFundsTable();  // Update the table after withdrawal
        alert(`Transaction ${txId} executed successfully.`);
    } catch (error) {
        console.error("Execution Error:", error.message);
        alert(`Execution failed: ${error.message}`);
    }
}



// Function to cancel a transfer
async function cancelTransfer(transferId) {
    try {
        console.log(`Attempting to cancel transfer with ID: ${transferId}`);

        // Fetch the transfer details
        const transferDetails = await contract.methods.getTransferDetails(transferId).call();
        console.log('Transfer Details:', transferDetails);

        // Check if the transfer is in the Locked state (status === 0)
        if (Number(transferDetails.status) !== 0) {
            throw new Error('Transfer is not in a cancellable state.');
        }

        // Verify if the user is the contract owner
        const contractOwner = await contract.methods.owner().call();
        if (userAccount.toLowerCase() !== contractOwner.toLowerCase()) {
            throw new Error('Only the contract owner can cancel transfers.');
        }

        // Proceed with the cancellation if checks pass
        await contract.methods.cancelTransfer(transferId).send({
            from: userAccount,
            gas: 5000000 // Adjust gas limit if necessary
        });

        console.log(`Transfer ID ${transferId} cancelled successfully.`);
        alert('Transfer cancelled and funds refunded.');
        updateClaimFundsTable(); // Refresh the table after cancellation
    } catch (error) {
        console.error("Cancellation Error:", error.message || error);
        alert(`Cancellation failed: ${error.message}`);
    }
}


// Function to execute a queued transaction
async function executeTransaction(txId) {
    try {
        const latestTime = Math.floor(Date.now() / 1000);  // Get the current timestamp
        await contract.methods.execute(txId, latestTime).send({
            from: userAccount,
            gas: 5000000  // Adjust gas limit if needed
        });
        updateClaimFundsTable();
        alert(`Transaction ${txId} executed successfully.`);
    } catch (error) {
        console.error("Execution Error:", error.message);
        alert(`Execution failed: ${error.message}`);
    }
}

// Function to cancel a queued transaction
async function cancelTransaction(txId) {
    try {
        await contract.methods.cancel(txId).send({
            from: userAccount,
            gas: 5000000  // Adjust gas limit if needed
        });
        updateClaimFundsTable();
        alert(`Transaction ${txId} canceled successfully.`);
    } catch (error) {
        console.error("Cancellation Error:", error.message);
        alert(`Cancellation failed: ${error.message}`);
    }
}


// Helper function to get transaction timestamp (You need to implement this based on events/logs)
async function getTransactionTimestampForTransfer(transferId) {
    const transferEvents = await contract.getPastEvents('TransferScheduled', {
        filter: { transferId },
        fromBlock: 0,
        toBlock: 'latest'
    });

    if (transferEvents.length > 0) {
        const transactionHash = transferEvents[0].transactionHash;
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);
        const block = await web3.eth.getBlock(receipt.blockNumber);
        return block.timestamp;
    }
    return Math.floor(Date.now() / 1000); // Fallback to current time if not found
}

async function getFilteredTransfersByStatus(statusFilter) {
    let transfers = [];

    // Fetch transfers directly by status (Locked, Claimed, Cancelled)
    if (statusFilter === 0 || statusFilter === 2 || statusFilter === 3) {
        transfers = await contract.methods.getTransfersByStatus(statusFilter).call();
    } else if (statusFilter === 1) { // Unlocked
        const allLockedTransfers = await contract.methods.getTransfersByStatus(0).call(); // Fetch Locked transfers

        for (const transferId of allLockedTransfers) {
            const transferDetails = await contract.methods.getTransferDetails(transferId).call();
            const unlockTime = Number(transferDetails.unlockTime);
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

            // Check if the transfer is unlocked based on time
            if (currentTime >= unlockTime) {
                transfers.push(transferId);  // Add only the unlocked transfers to the list
            }
        }
    }

    return transfers;
}

async function applyFilter() {
    console.log("Apply filter clicked");

    const statusFilter = document.getElementById('filterStatus').value;
    const recipientFilter = document.getElementById('filterRecipient').value.toLowerCase();
    let filteredTransfers = [];

    try {
        // Fetch all transactions
        const { _keys, targets, values, timestamps, queuedStatuses } = await contract.methods.iterateTransactions().call();

        // Loop through all transactions and apply filters
        for (let i = 0; i < _keys.length; i++) {
            let statusMatch = false;
            let recipientMatch = false;

            // Status filter (Queued and Cancelled or All)
            let statusLabel = '';
            switch (Number(queuedStatuses[i])) {
                case 1: statusLabel = 'queued'; break;  // Queued status
                case 3: statusLabel = 'cancelled'; break;  // Cancelled status
            }

            // Check if the current status matches the selected filter or show all if "all" is selected
            if (statusFilter === 'all' || statusLabel === statusFilter) {
                statusMatch = true;
            }

            // Recipient filter
            if (recipientFilter === '') {
                recipientMatch = true; // No recipient filter applied
            } else if (targets[i] && targets[i].toLowerCase() === recipientFilter) {
                recipientMatch = true;
            }

            // If both status and recipient match, include the transfer
            if (statusMatch && recipientMatch) {
                filteredTransfers.push({
                    key: _keys[i],
                    target: targets[i],
                    value: values[i],
                    timestamp: timestamps[i],
                    status: queuedStatuses[i]
                });
            }
        }

        // Update the table with filtered results
        updateFilteredTable(filteredTransfers);

    } catch (error) {
        console.error("Error in applyFilter:", error.message || error);
        alert("An error occurred while applying the filter.");
    }
}


// Function to update the table with filtered transactions
function updateFilteredTable(filteredTransfers) {
    const tableBody = document.querySelector('#claimFundsTableBody');
    tableBody.innerHTML = ''; // Clear the table

    // Loop through the filtered transfers and create table rows
    filteredTransfers.forEach(transfer => {
        let statusLabel = '';
        switch (Number(transfer.status)) {
            case 1: statusLabel = 'Queued'; break;
            case 3: statusLabel = 'Cancelled'; break;
        }

        const recipientAddress = (transfer.target.toLowerCase() === userAccount.toLowerCase()) ? 'You' : transfer.target;
        const unlockTime = Number(transfer.timestamp);  // Timestamp is the unlock time

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userAccount}</td>
            <td>${recipientAddress}</td>
            <td>${new Date(Number(transfer.timestamp) * 1000).toLocaleString()}</td>
            <td>${web3.utils.fromWei(transfer.value.toString(), 'ether')}</td>
            <td>${statusLabel}</td>
            <td><button ${statusLabel === 'Queued' ? '' : 'disabled'} onclick="modifyTransaction('${transfer.key}')">Modify</button></td>
            <td><button ${statusLabel === 'Queued' ? '' : 'disabled'} onclick="cancelTransaction('${transfer.key}')">Cancel</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusEnum(statusFilter) {
    switch (statusFilter) {
        case 'locked':
            return 0; // Status.Locked
        case 'unlocked':
            return 1; // Status.Unlocked
        case 'claimed':
            return 2; // Status.Claimed
        case 'cancelled':
            return 3; // Status.Cancelled
        default:
            return 0; // Default to Locked
    }
}

// Add event listener to the apply filter button
document.getElementById('applyFilterButton').addEventListener('click', applyFilter);





function getStatusLabel(status) {
    switch (Number(status)) {
        case 0:
            return 'Locked';
        case 1:
            return 'Unlocked';
        case 2:
            return 'Claimed';
        case 3:
            return 'Cancelled';
        default:
            return 'Unknown';
    }
}

async function updateQueuedTransactionsTable() {
    const tableBody = document.querySelector('#queuedTransactionsTableBody');
    tableBody.innerHTML = ''; // Clear the table

    const { _keys, targets, values, timestamps, queuedStatuses } = await contract.methods.iterateTransactions().call();
    
    for (let i = 0; i < _keys.length; i++) {
        let statusLabel = '';
        switch (queuedStatuses[i]) {
            case 1: statusLabel = 'Queued'; break;
            case 2: statusLabel = 'Executed'; break;
            case 3: statusLabel = 'Cancelled'; break;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${_keys[i]}</td>
            <td>${targets[i]}</td>
            <td>${new Date(timestamps[i] * 1000).toLocaleString()}</td>
            <td>${web3.utils.fromWei(values[i], 'ether')}</td>
            <td>${statusLabel}</td>
            <td><button ${statusLabel !== 'Queued' ? 'disabled' : ''} onclick="executeTransaction('${_keys[i]}')">Execute</button></td>
            <td><button ${statusLabel === 'Queued' ? '' : 'disabled'} onclick="cancelTransaction('${_keys[i]}')">Cancel</button></td>
        `;
        tableBody.appendChild(row);
    }
}
