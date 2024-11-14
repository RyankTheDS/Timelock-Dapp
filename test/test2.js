const TimeLock = artifacts.require("TimeLock");

contract("TimeLock", (accounts) => {
  const [owner, addr1, addr2] = accounts;
  let timeLockInstance;

  beforeEach(async () => {
    timeLockInstance = await TimeLock.new({ from: owner });
  });

  it("should set the correct owner on deployment", async () => {
    const contractOwner = await timeLockInstance.owner();
    assert.equal(contractOwner, owner, "Owner is not correctly set");
  });

  it("should queue a transaction successfully", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100;
    const amount = web3.utils.toWei('1', 'ether');

    // Queue transaction
    const txId = await timeLockInstance.getTxId(target, timestamp, amount, 0);
    await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: amount });

    // Check if the transaction is queued
    const queuedTx = await timeLockInstance.queued(txId);
    assert.equal(queuedTx.target, target, "Target address is incorrect");
    assert.equal(queuedTx.timestamp.toNumber(), timestamp, "Timestamp is incorrect");
    assert.equal(queuedTx.amount.toString(), amount, "Amount is incorrect");
    assert.equal(queuedTx.status.toNumber(), 1, "Transaction status is not 'queued'");
  });

  

  it("should allow the owner to execute a queued transaction", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100;
    const amount = web3.utils.toWei('1', 'ether');

    // Queue the transaction
    await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: amount });

    // Advance time (using Truffle's time functions to simulate time passing)
    await timeLockInstance.getFutureTimestamp();

    // Execute the transaction
    const latestTime = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 101;
    const txId = await timeLockInstance.getTxId(target, timestamp, amount, 0);
    await timeLockInstance.execute(txId, latestTime, { from: owner });

    // Check the transaction status
    const executedTx = await timeLockInstance.queued(txId);
    assert.equal(executedTx.status.toNumber(), 2, "Transaction was not executed");
  });

  it("should allow the owner to cancel a queued transaction", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100;
    const amount = web3.utils.toWei('1', 'ether');

    // Queue the transaction
    const txId = await timeLockInstance.getTxId(target, timestamp, amount, 0);
    await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: amount });

    // Cancel the transaction
    await timeLockInstance.cancel(txId, { from: owner });

    // Check if the transaction status is 'cancelled'
    const cancelledTx = await timeLockInstance.queued(txId);
    assert.equal(cancelledTx.status.toNumber(), 3, "Transaction was not cancelled");
  });

  //New ones

  it("should allow the owner to modify a queued transaction", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100;
    const amount = web3.utils.toWei('1', 'ether');

    // Queue the transaction
    const txId = await timeLockInstance.getTxId(target, timestamp, amount, 0);
    await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: amount });

    // Modify the transaction (new values for target, timestamp, and amount)
    const newTarget = addr2;
    const newTimestamp = timestamp + 200;
    const newAmount = web3.utils.toWei('2', 'ether');

    // Send extra amount when modifying the queued transaction
    await timeLockInstance.modify(txId, newTarget, newTimestamp, newAmount, { from: owner, value: web3.utils.toWei('1', 'ether') });

    // Retrieve the modified transaction details
    const modifiedTx = await timeLockInstance.queued(txId);
  
    // Assertions to check if the modification succeeded
    assert.equal(modifiedTx.target, newTarget, "Target address was not modified correctly");
    assert.equal(modifiedTx.timestamp.toNumber(), newTimestamp, "Timestamp was not modified correctly");
    assert.equal(modifiedTx.amount.toString(), newAmount, "Amount was not modified correctly");
    assert.equal(modifiedTx.status.toNumber(), 1, "Transaction status should still be 'queued'");
  });

  it("should revert when queuing a transaction with incorrect ETH amount sent", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100; // Future timestamp
    const amount = web3.utils.toWei('1', 'ether');
    const incorrectAmount = web3.utils.toWei('0.5', 'ether'); // Incorrect amount for testing

    try {
        // Attempt to queue transaction with incorrect ETH amount
        await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: incorrectAmount });
        assert.fail("Transaction succeeded despite sending incorrect ETH amount");
    } catch (error) {
        // Check if the error message matches the expected revert message
        assert(error.message.includes('Incorrect ETH amount sent'), 'Expected revert message not received');
    }
});

it("should not execute a non-existent transaction", async () => {
    const nonExistentTxId = web3.utils.sha3("nonExistentTransactionId"); // Generate a hash for a non-existent transaction
    const latestTime = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 1;

    // Try executing the non-existent transaction
    let errorCaught = false;
    try {
        await timeLockInstance.execute(nonExistentTxId, latestTime, { from: owner });
    } catch (error) {
        errorCaught = true; // Set flag to true if an error is caught
    }

    // Check that an error was caught
    assert.isTrue(errorCaught, "Expected error was not caught");
});


it("should revert when attempting to modify a transaction that does not exist", async () => {
    const nonExistentTxId = web3.utils.keccak256("nonExistentTxId");
    const newTarget = addr2;
    const newTimestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 200;
    const newAmount = web3.utils.toWei('0.5', 'ether');

    let errorCaught = false;

    try {
        // Attempt to modify the transaction that does not exist
        await timeLockInstance.modifyTransaction(nonExistentTxId, newTarget, newTimestamp, newAmount, { from: owner });
    } catch (error) {
        errorCaught = true; // If an error is caught, set errorCaught to true
    }

    assert.isTrue(errorCaught, "Expected an error to be thrown when modifying a non-existent transaction");
});

it("should revert when attempting to modify an executed transaction", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100;
    const amount = web3.utils.toWei('1', 'ether');

    // Queue the transaction
    await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: amount });

    // Advance time to execute the transaction
    await timeLockInstance.getFutureTimestamp();
    const txId = await timeLockInstance.getTxId(target, timestamp, amount, 0);

    // Execute the transaction to cancel it
    await timeLockInstance.execute(txId, (await timeLockInstance.getCurrentTimestamp()).toNumber() + 101, { from: owner });

    // Attempt to modify the cancelled transaction
    const newTarget = addr2;
    const newTimestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 200;
    const newAmount = web3.utils.toWei('0.5', 'ether');

    let errorCaught = false;

    try {
        // Try to modify the cancelled transaction
        await timeLockInstance.modify(txId, newTarget, newTimestamp, newAmount, { from: owner });
    } catch (error) {
        errorCaught = true; // If an error is caught, set errorCaught to true
    }

    assert.isTrue(errorCaught, "Expected an error to be thrown when modifying a cancelled transaction");
});

it("should revert when attempting to modify a cancelled transaction", async () => {
    const target = addr1;
    const timestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 100;
    const amount = web3.utils.toWei('1', 'ether');

    // Queue the transaction
    await timeLockInstance.queue(target, timestamp, amount, { from: owner, value: amount });

    // Cancel the transaction
    const txId = await timeLockInstance.getTxId(target, timestamp, amount, 0);
    await timeLockInstance.cancel(txId, { from: owner }); // Using the cancel function

    // Attempt to modify the cancelled transaction
    const newTarget = addr2;
    const newTimestamp = (await timeLockInstance.getCurrentTimestamp()).toNumber() + 200;
    const newAmount = web3.utils.toWei('0.5', 'ether');

    let errorCaught = false;

    try {
        // Try to modify the cancelled transaction
        await timeLockInstance.modify(txId, newTarget, newTimestamp, newAmount, { from: owner });
    } catch (error) {
        errorCaught = true; // If an error is caught, set errorCaught to true
    }

    assert.isTrue(errorCaught, "Expected an error to be thrown when modifying a cancelled transaction");
});













  





});
