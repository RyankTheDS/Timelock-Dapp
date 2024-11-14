let parentWalletAddress = '';  // Variable for storing parent wallet address
let childWalletAddress = '';   // Variable for storing child wallet address

async function initContract() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log('MetaMask detected');
        await loadData();

        const walletAddressParent = accounts[0]; // Example for parent
        const walletAddressChild = accounts[0];  // Example for child

        displayParentData(walletAddressParent);
        displayChildData(walletAddressChild);
        loginParent(walletAddressParent);
    } else {
        alert('MetaMask is not installed. Please install it to use this feature.');
    }
}

window.onload = initContract;

window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        console.log('Connected account:', accounts[0]);
        contract = new web3.eth.Contract(contractABI, contractAddress);

        const parentWalletInput = document.getElementById('parentWallet');
        const childWalletInput = document.getElementById('childWallet');

        // Fetch parent or child data
        try {
            const parentData = await contract.methods.getParent(accounts[0]).call();
            const childData = await contract.methods.getChild(accounts[0]).call();

            // Store parent and child wallet addresses in variables
            parentWalletAddress = parentData.walletAddress;
            childWalletAddress = childData.walletAddress;

            // Populate the textboxes with the wallet addresses
            if (parentData.walletAddress !== "0x0000000000000000000000000000000000000000") {
                parentWalletInput.value = parentWalletAddress;
                childWalletAddress = '';
            }

            if (childWalletAddress) {
                childWalletInput.value = childWalletAddress;
                parentWalletAddress = '';
            }

        } catch (error) {
            console.error("Error fetching parent or child data:", error);
            parentWalletInput.value = "Error fetching data.";
            childWalletInput.value = "Error fetching data.";
        }
    } else {
        alert('Please install MetaMask to use this feature.');
    }
});
