// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

//For Timelock 
contract TimeLock {
    error NotOwnerError();
    error AlreadyQueuedError(bytes32 txId);
    error TimestampNotInRangeError(uint256 blockTimestamp, uint256 timestamp);
    error NotQueuedError(bytes32 txId);
    error TimestampNotPassedError(uint256 blockTimestmap, uint256 timestamp);
    error TimestampExpiredError(uint256 blockTimestamp, uint256 expiresAt);
    error TxFailedError();

    event Queue(
        bytes32 indexed txId,
        address indexed target,
        uint256 timestamp,
        uint256 amount
    );
    event Execute(
        bytes32 indexed txId,
        address indexed target,
        uint256 timestamp,
        uint256 amount
    );
    event Cancel(bytes32 indexed txId);

    event TransactionModified(
        bytes32 indexed txId,
        address newTarget,
        uint256 newTimestamp,
        uint256 amount
    );

    event RequestSent(
        uint256 requestNo,
        address requestor,
        uint256 time,
        uint amount
    );

    // Event to emit when a student request is canceled
    event RequestCanceled(uint256 requestId);

    uint256 public constant MIN_DELAY = 10; // seconds
    //uint256 public constant MAX_DELAY = 1000; // seconds
    uint256 public constant MAX_DELAY = 864000; // seconds
    uint256 public constant GRACE_PERIOD = 1000; // seconds

    address payable public owner;

    //address payable public sender;

    struct Transaction {
        address target;
        uint256 timestamp;
        uint256 amount;
        uint8 status;
    }
    //Status:
    //1 = Queueing
    //2 = Executed
    //3 = Cancelled

    // New Struct for Student Request
    struct StudentRequest {
        uint256 id;           // Unique numeric identifier for each request
        address studentAddress;
        uint256 timestamp;
        uint256 amount;
        bool active;
    }

    //For Student Purpose
    uint256 public requestCounter;  // Counter for generating unique IDs
    mapping(uint256 => StudentRequest) public studentRequests;  // Mapping to store requests by ID
    uint256[] public requestIds;    // Array to store request IDs

    //For Parent Purpose
    // tx id => queued
    mapping(bytes32 => Transaction) public queued;
    mapping(address => uint256) public nonces;
    bytes32[] public keys;

    //mapping(bytes32 => bool) public queued;


    constructor() {
        owner = payable(msg.sender);
        //owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwnerError();
        }
        _;
    }

    receive() external payable {}

    //For Parent Purpose

    function getTxId(
        address _target,
        uint256 _timestamp,
        uint256 _amount,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_target, _timestamp, _amount, nonce));
    }

    
    function queue(
        address _target,
        uint256 _timestamp,
        uint256 _amount
    ) external payable {
        require(msg.value == _amount, "Incorrect ETH amount sent");
        uint256 nonce = nonces[msg.sender]++;
        bytes32 txId = getTxId(_target, _timestamp, _amount, nonce);
        if (queued[txId].status == 1) {
            revert AlreadyQueuedError(txId);
        }
        // ---|------------|---------------|-------
        //  block    block + min     block + max
        if (
            _timestamp < block.timestamp + MIN_DELAY || 
            _timestamp > block.timestamp + MAX_DELAY
        ) {
            revert TimestampNotInRangeError(block.timestamp, _timestamp);
        }

        Transaction memory newTransaction = Transaction({
            target: _target,
            timestamp: _timestamp,
            amount: _amount,
            status: 1
        });

        queued[txId] = newTransaction;

        //queued[txId].queued = true;
        keys.push(txId);

        emit Queue(txId, _target, _timestamp, _amount);
    }

    
    function modify(
        bytes32 _txId,
        address _newTarget,
        uint256 _newTimestamp,
        uint256 _newAmount
    ) external payable {
        if (queued[_txId].status != 1) {
            revert NotQueuedError(_txId);
        }

        if (
            _newTimestamp < block.timestamp + MIN_DELAY || 
            _newTimestamp > block.timestamp + MAX_DELAY
        ) {
            revert TimestampNotInRangeError(block.timestamp, _newTimestamp);
        }

         // Get the current amount
        uint256 currentAmount = queued[_txId].amount;

        if (_newAmount > currentAmount) {
            // Transfer more money to the contract
            // If the new amount is greater, check if enough ETH was sent
            uint256 extraAmountRequired = _newAmount - currentAmount;
            require(msg.value >= extraAmountRequired, "Not enough ETH sent for increase");

            // Any extra ETH sent above the required amount will be refunded
            uint256 refund = msg.value - extraAmountRequired;
            if (refund > 0) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
                require(refundSuccess, "Refund failed");
            }
        } else if (_newAmount < currentAmount) {
        // Withdraw the excess amount back to the owner
            uint256 amountToWithdraw = currentAmount - _newAmount;

            // Check if the contract has enough balance to withdraw
            require(address(this).balance >= amountToWithdraw, "Insufficient contract balance");

            (bool success, ) = payable(msg.sender).call{value: amountToWithdraw}("");
            //(bool success, ) = owner.call{value: amountToWithdraw}("");
            require(success, "Withdraw failed");
        } else {
        // If amounts are equal, ensure that no additional value is sent
            require(msg.value == 0, "No additional ETH should be sent");
        }

        queued[_txId].target = _newTarget;
        queued[_txId].timestamp = _newTimestamp;
        queued[_txId].amount = _newAmount;

        emit TransactionModified(_txId, _newTarget, _newTimestamp, _newAmount);
    }


    function execute(
        bytes32 _txId,
        uint256 _latestTime
    ) external payable {
        if (queued[_txId].status != 1) {
            revert NotQueuedError(_txId);
        }
        // ----|-------------------|-------
        //  timestamp    timestamp + grace period
        if (_latestTime < queued[_txId].timestamp) {
            revert TimestampNotPassedError(_latestTime, queued[_txId].timestamp);
        }
        if (_latestTime > queued[_txId].timestamp + GRACE_PERIOD) {
            queued[_txId].status = 3;
            revert TimestampExpiredError(
                _latestTime, queued[_txId].timestamp + GRACE_PERIOD
            );
        }        

        // Transfer the amount to the recipient
        (bool success, ) = queued[_txId].target.call{value: queued[_txId].amount}("");
        require(success, "Transfer failed");

        queued[_txId].status = 2;
        
        emit Execute(_txId, queued[_txId].target, queued[_txId].timestamp, queued[_txId].amount);
    }

    function cancel(bytes32 _txId) external {
        if (queued[_txId].status != 1) {
            revert NotQueuedError(_txId);
        }

        // Retrieve the amount to be refunded
        uint256 amountToRefund = queued[_txId].amount;

        queued[_txId].status = 3;

        // Transfer the amount back to the owner
        (bool success, ) = payable(msg.sender).call{value: amountToRefund}("");
        //(bool success, ) = owner.call{value: amountToRefund}("");
        require(success, "Refund failed");

        emit Cancel(_txId);
    }

    //Temporary function
    function getFutureTimestamp() external view returns (uint) {
        return block.timestamp + 100;
    }

    function getCurrentTimestamp() external view returns (uint) {
        return block.timestamp;
    }

    function iterateTransactions() public view returns (
        bytes32[] memory _keys,
        address[] memory targets,
        uint256[] memory values,
        uint256[] memory timestamps,
        uint8[] memory queuedStatuses
    ) {
        uint256 length = keys.length;

        // Create arrays to hold the transaction details
        targets = new address[](length);
        values = new uint256[](length);
        timestamps = new uint256[](length);
        queuedStatuses = new uint8[](length);

        for (uint256 i = 0; i < length; i++) {
            bytes32 key = keys[i];
            Transaction memory txn = queued[key];

            targets[i] = txn.target;
            values[i] = txn.amount;
            timestamps[i] = txn.timestamp;
            queuedStatuses[i] = txn.status;
        }

        return (keys, targets, values, timestamps, queuedStatuses);
    }   

    //For Student
    // Function to create a new student request
    function createRequest(
        address _studentAddress,
        uint256 _amount,
        uint256 _suggestedTime
    ) public {
        // Validate that the student address is not zero
        require(_studentAddress != address(0), "Invalid student address");

        // Validate that the amount is greater than 0 and within a specific limit (e.g., max 100 ETH)
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= 100 ether, "Amount exceeds maximum limit");

        // Validate that the suggested timestamp is within a valid range (e.g., between MIN_DELAY and MAX_DELAY)
        require(
            _suggestedTime >= block.timestamp + MIN_DELAY &&
                _suggestedTime <= block.timestamp + MAX_DELAY,
            "Suggested time is out of range"
        );

        requestCounter++; // Increment the counter to get a unique ID

        // Create a new StudentRequest and store it in the mapping
        studentRequests[requestCounter] = StudentRequest(
            requestCounter, // Set the unique ID
            _studentAddress,
            _suggestedTime,
            _amount,
            true
        );

        // Store the request ID in the array
        requestIds.push(requestCounter);

        emit RequestSent(
            requestCounter,
            _studentAddress,
            _suggestedTime,
            _amount
        );
    }



    // Function to cancel a student request
    function cancelRequest(uint256 _requestId) external {
        // Check if the request exists
        StudentRequest storage request = studentRequests[_requestId];
        require(request.id != 0, "Request not found");

        // Ensure that only the student who created the request can cancel it
        require(msg.sender == request.studentAddress, "Not the request owner");

        // Ensure the request is still active
        require(request.active, "Request already canceled");

        // Mark the request as canceled
        request.active = false;

        // Emit event that the request has been canceled
        emit RequestCanceled(_requestId);
    }







    //Function to iterate over all requests and return their details
    function iterateRequests() public view returns (
        uint256[] memory ids,
        address[] memory studentAddresses,
        uint256[] memory timestamps,
        uint256[] memory amounts,
        bool[] memory activeStatuses
    ) {
        uint256 length = requestIds.length;

        // Create arrays to hold the request details
        ids = new uint256[](length);
        studentAddresses = new address[](length);
        timestamps = new uint256[](length);
        amounts = new uint256[](length);
        activeStatuses = new bool[](length); 

        for (uint256 i = 0; i < length; i++) {
            uint256 requestId = requestIds[i];
            StudentRequest memory request = studentRequests[requestId];

            ids[i] = request.id;
            studentAddresses[i] = request.studentAddress;
            timestamps[i] = request.timestamp;
            amounts[i] = request.amount;
            activeStatuses[i] = request.active; 
        }

        return (ids, studentAddresses, timestamps, amounts, activeStatuses);
    }

    //Sean function
    function getTransferDetails(bytes32 _transactionId) // can be considered
        public
        view
        returns (
            address recipient,
            uint256 amount,
            uint256 unlockTime,
            uint status
        )
    {
        Transaction storage transfer = queued[_transactionId];
        return (
            transfer.target,
            transfer.amount,
            transfer.timestamp,
            transfer.status
        );
    }

    //Sean function
    function getTransfersByStatus(uint8 _status) // can be considered
        public
        view
        returns (bytes32[] memory)
    {
        uint256 count = 0;

        // First, count how many transfers match the status
        for (uint256 i = 0; i < keys.length; i++) {
            if (queued[keys[i]].status == _status) {
                count++;
            }
        }

        // If no transfers are found, return an empty array instead of reverting
        if (count == 0) {
            return new bytes32[](0); // Return an empty array
        }

        // Then create an array of matching transfer IDs
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < keys.length; i++) {
            if (queued[keys[i]].status == _status) {
                result[index] = keys[i];
                index++;
            }
        }

        return result;
    }

    function getTransfersByRecipient(address _recipient) 
        public
        view
        returns (bytes32[] memory)
    {
        uint256 count = 0;

        // Count the transfers to the given recipient
        for (uint256 i = 0; i < keys.length; i++) {
            if (queued[keys[i]].target == _recipient) {
                count++;
            }
        }

        // Then create an array of matching transfer IDs
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < keys.length; i++) {
            if (queued[keys[i]].target == _recipient) {
                result[index] = keys[i];
                index++;
            }
        }

        return result;
    }


    function getTransfersByStatusAndRecipient( // can be considered
        uint8 _status,
        address _recipient
    ) public view returns (bytes32[] memory) {
        uint256 count = 0;

        // Count the transfers that match both criteria
        for (uint256 i = 0; i < keys.length; i++) {
            if (
                queued[keys[i]].status == _status &&
                queued[keys[i]].target == _recipient
            ) {
                count++;
            }
        }

        // Then create an array of matching transfer IDs
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < keys.length; i++) {
            if (
                queued[keys[i]].status == _status &&
                queued[keys[i]].target == _recipient
            ) {
                result[index] = keys[i];
                index++;
            }
        }

        return result;
    }

    function getTransfersByStatusPaginated(
        uint8 _status, 
        uint256 startIndex, 
        uint256 endIndex
    ) public view returns (bytes32[] memory) {
        require(endIndex > startIndex, "Invalid indices");
        require(endIndex <= keys.length, "Index out of bounds");

        // Count how many transactions match the status
        uint256 count = 0;
        for (uint256 i = startIndex; i < endIndex && i < keys.length; i++) {
            // Debug: log the status for each key
            if (queued[keys[i]].status == _status) {
                count++;
            }
        }

        // If no matching transactions, return empty array
        if (count == 0) {
            return new bytes32[](0) ;
        }

        // Create the result array
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;

        // Populate the result array with matching transactions
        for (uint256 i = startIndex; i < endIndex && i < keys.length; i++) {
            if (queued[keys[i]].status == _status) {
                result[index] = keys[i];
                index++;
            }
        }

        return result;
    }

}




