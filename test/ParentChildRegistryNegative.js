const ParentChildRegistry = artifacts.require("ParentChildRegistry");

contract("ParentChildRegistry", accounts => {
    let registry;
    const parentAccount = accounts[1];
    const childAccount = accounts[2];

    beforeEach(async () => {
        registry = await ParentChildRegistry.new();
    });

    describe("Negative Tests", () => {
        it("should fail to register a child with an invalid date of birth", async () => {
            await registry.registerParent(
                "Alice Smith",
                "alice.smith@example.com",
                "1234567890",
                "789 Pine St",
                1995,
                "GOV98765",
                "Mother",
                "securePassword",
                { from: parentAccount }
            );

            try {
                await registry.registerChild(
                    "Charlie Smith",
                    2025, // Future date of birth
                    "5th Grade",
                    "STU001",
                    "childSecurePassword",
                    { from: parentAccount }
                );
                assert.fail("Expected revert not received");
            } catch (error) {
                assert(
                    error.message.includes("Invalid year of birth"),
                    `Expected "Invalid year of birth" but got ${error.message}`
                );
            }
        });

        it("should fail to log in a child with a non-existent studentID", async () => {
            await registry.registerParent(
                "Alice Smith",
                "alice.smith@example.com",
                "1234567890",
                "789 Pine St",
                1995,
                "GOV98765",
                "Mother",
                "securePassword",
                { from: parentAccount }
            );

            // Register a child
            await registry.registerChild(
                "Charlie Smith",
                2010,
                "5th Grade",
                "STU001",
                "childSecurePassword",
                { from: parentAccount }
            );

            // Attempt login with a non-existent studentID
            const result = await registry.loginChild("INVALID_STU_ID", "childSecurePassword");
            assert.isFalse(result, "Expected child login to fail with non-existent studentID");
        });
    });
});
