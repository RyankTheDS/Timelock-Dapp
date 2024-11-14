let currentAccount;
let contract;
const contractABI =[
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "childAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "fullName",
          "type": "bytes32"
        }
      ],
      "name": "ChildRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "parentAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "fullName",
          "type": "bytes32"
        }
      ],
      "name": "ParentRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "children",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "fullName",
          "type": "bytes32"
        },
        {
          "internalType": "uint16",
          "name": "dob",
          "type": "uint16"
        },
        {
          "internalType": "bytes32",
          "name": "gradeClass",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "studentID",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "passwordHash",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "parents",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "fullName",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "phone",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "residentialAddress",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "dob",
          "type": "uint16"
        },
        {
          "internalType": "bytes32",
          "name": "govID",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "relationship",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "passwordHash",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_fullName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_phone",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_residentialAddress",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "_dob",
          "type": "uint16"
        },
        {
          "internalType": "string",
          "name": "_govID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_relationship",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        }
      ],
      "name": "registerParent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_fullName",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "_dob",
          "type": "uint16"
        },
        {
          "internalType": "string",
          "name": "_gradeClass",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_studentID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        }
      ],
      "name": "registerChild",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getParentCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getChildCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getParent",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "fullName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "phone",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "residentialAddress",
              "type": "string"
            },
            {
              "internalType": "uint16",
              "name": "dob",
              "type": "uint16"
            },
            {
              "internalType": "bytes32",
              "name": "govID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "relationship",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "passwordHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            }
          ],
          "internalType": "struct ParentChildRegistry.Parent",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getChild",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "fullName",
              "type": "bytes32"
            },
            {
              "internalType": "uint16",
              "name": "dob",
              "type": "uint16"
            },
            {
              "internalType": "bytes32",
              "name": "gradeClass",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "studentID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "passwordHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            }
          ],
          "internalType": "struct ParentChildRegistry.Child",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllParents",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "fullName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "phone",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "residentialAddress",
              "type": "string"
            },
            {
              "internalType": "uint16",
              "name": "dob",
              "type": "uint16"
            },
            {
              "internalType": "bytes32",
              "name": "govID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "relationship",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "passwordHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            }
          ],
          "internalType": "struct ParentChildRegistry.Parent[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllChildren",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "fullName",
              "type": "bytes32"
            },
            {
              "internalType": "uint16",
              "name": "dob",
              "type": "uint16"
            },
            {
              "internalType": "bytes32",
              "name": "gradeClass",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "studentID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "passwordHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            }
          ],
          "internalType": "struct ParentChildRegistry.Child[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        }
      ],
      "name": "loginParent",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_studentID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        }
      ],
      "name": "loginChild",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];
const contractAddress = '0x1EecFB0e47Fb3F770A618AaB837a98181eC5D10B'; // Replace with your deployed contract address
;

async function initContract() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress);
    } else {
        alert('MetaMask is not installed. Please install it to use this feature.');
    }
}

//async function connectMetaMask() {
//    if (typeof window.ethereum !== 'undefined') {
//        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//        currentAccount = accounts[0];
//    } else {
//        alert('MetaMask is not installed. Please install it to use this feature.');
//    }
//}

async function connectMetaMask() {
if (typeof window.ethereum !== 'undefined') {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        document.getElementById('parentAccountDisplay').innerText = `Connected: ${currentAccount}`;
        document.getElementById('childAccountDisplay').innerText = `Connected: ${currentAccount}`;
    } catch (error) {
        console.error("MetaMask connection failed", error);
        alert('Could not connect to MetaMask. Please try again.');
    }
} else {
    alert('MetaMask is not installed. Please install it to use this feature.');
}
}


