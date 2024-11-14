const ParentChildRegistry = artifacts.require("ParentChildRegistry");

contract("ParentChildRegistry", (accounts) => {
    let registry;
    const [parentAccount, childAccount] = accounts;

    beforeEach(async () => {
        registry = await ParentChildRegistry.new();
    });

    describe("Positive Tests", () => {
        it("should register a parent successfully and emit the ParentRegistered event", async () => {
            const result = await registry.registerParent(
                "Alice Smith",
                "alice.smith@example.com",
                "1234567890",
                "789 Pine St",
                1995,
                "GOV98765",
                "Mother",
                "securePassword"
            );

            const parentCount = await registry.getParentCount();
            assert.equal(parentCount.toString(), "1", "Parent count should be 1");

            const parent = await registry.getParent(0);
            assert.equal(parent.email, "alice.smith@example.com", "Email should match");
            assert.equal(web3.utils.toUtf8(parent.fullName), "Alice Smith", "Full name should match");

            const event = result.logs[0];
            assert.equal(event.event, "ParentRegistered", "Event type should be ParentRegistered");
            assert.equal(event.args.parentAddress, parentAccount, "Parent address should match");
            assert.equal(web3.utils.toUtf8(event.args.fullName), "Alice Smith", "Full name in event should match");
        });

        it("should register a child successfully and emit the ChildRegistered event", async () => {
            await registry.registerParent(
                "Alice Smith",
                "alice.smith@example.com",
                "1234567890",
                "789 Pine St",
                1995,
                "GOV98765",
                "Mother",
                "securePassword"
            );

            const result = await registry.registerChild(
                "Charlie Smith",
                2010,
                "5th Grade",
                "STU001",
                "childSecurePassword",
                { from: parentAccount } // Ensure this is the correct parent account
            );

            const childCount = await registry.getChildCount();
            assert.equal(childCount.toString(), "1", "Child count should be 1");

            const child = await registry.getChild(0);
            assert.equal(web3.utils.toUtf8(child.studentID), "STU001", "Student ID should match");
            assert.equal(web3.utils.toUtf8(child.fullName), "Charlie Smith", "Child's full name should match");

            const event = result.logs[0];
            assert.equal(event.event, "ChildRegistered", "Event type should be ChildRegistered");
            assert.equal(event.args.childAddress, parentAccount, "Child address should match"); // This should be the same as the parent account
            assert.equal(web3.utils.toUtf8(event.args.fullName), "Charlie Smith", "Full name in event should match");
        });

        it("should allow a parent to log in successfully", async () => {
            await registry.registerParent(
                "Alice Smith",
                "alice.smith@example.com",
                "1234567890",
                "789 Pine St",
                1995,
                "GOV98765",
                "Mother",
                "securePassword"
            );

            const isLoggedIn = await registry.loginParent("alice.smith@example.com", "securePassword");
            assert.isTrue(isLoggedIn, "Parent should be logged in successfully");
        });

        it("should register a child successfully and emit the ChildRegistered event", async () => {
            await registry.registerParent(
                "Alice Smith",
                "alice.smith@example.com",
                "1234567890",
                "789 Pine St",
                1995,
                "GOV98765",
                "Mother",
                "securePassword"
            );
        
            // Register the child
            const result = await registry.registerChild(
                "Charlie Smith",
                2010,
                "5th Grade",
                "STU001",
                "childSecurePassword",
                { from: parentAccount }
            );
        
            const childCount = await registry.getChildCount();
            assert.equal(childCount.toString(), "1", "Child count should be 1");
        
            const child = await registry.getChild(0);
            assert.equal(web3.utils.toUtf8(child.studentID), "STU001", "Student ID should match");
            assert.equal(web3.utils.toUtf8(child.fullName), "Charlie Smith", "Child's full name should match");
        
            const event = result.logs[0];
            assert.equal(event.event, "ChildRegistered", "Event type should be ChildRegistered");
            assert.equal(event.args.childAddress, parentAccount, "Child address should match");
            assert.equal(web3.utils.toUtf8(event.args.fullName), "Charlie Smith", "Full name in event should match");
        });
    });
});
