# Timelock dApp for Parental Allowance
i) SMART CONTRACTS
- 3 contracts in total
- 2 contracts in 'contracts' folder to be deployed locally
- 1 contract in 'Chainlink contract' folder. 

ii) PROCEDURES TO DEPLOY CHAINLINK CONTRACT ON ETHEREUM SEPOLIA TESTNET
- Open Remix
- Paste the contract there
- Choose Injected Provider - Metamask
- Connect to Sepolia ETH metamask wallet
- Deploy contract
- Pay the fee
- Go to https://automation.chain.link/
- Register new Upkeep
- Choose time-based upkeep
- Enter contract address
- Enter abi
- Select the 'request' function to be called by Chainlink Upkeep
- Choose to upkeep every 1 minute using CRON expression
- Give upkeep a name
- Place Link Tokens into Link Balance
- Register Upkeep

iii) PROCEDURES TO DEPLOY THE OTHER 2 SMART CONTRACTS ON GANACHE & INTERACT WITH THE DAPP
- Do not need to 'truffle compile' and 'truffle test' as they have already been done
- In command line, write 'truffle migrate' in the 'TimelockDApp Final Submission' directory
- Copy the 2 contract addresses into the .js files in the js folder and the login.html and register.html files
- In command line, go to the 'src' folder and enter 'node myserver14.js'
- In browser, enter '127.0.0.1:5000'
- Use the DAPP, ensuring that you do connect to a few wallets from Ganache

IMPORTANT NOTE: To view the design of each web page, it is important to start Node.js first (review the myserver14.js to understand this). Do not click directly into the .html and .css files
