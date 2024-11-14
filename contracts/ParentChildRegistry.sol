// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract ParentChildRegistry {
    struct Parent {
        bytes32 fullName;
        string email;
        string phone;
        string residentialAddress;
        uint16 dob;
        bytes32 govID;
        bytes32 relationship;
        bytes32 passwordHash; // Store password as a hashed value
        address walletAddress; // Store MetaMask address
    }

    struct Child {
        bytes32 fullName;
        uint16 dob;
        bytes32 gradeClass;
        bytes32 studentID;
        bytes32 passwordHash; // Store password as a hashed value
        address walletAddress; // Store MetaMask address for the child
    }

    Parent[] public parents; // Store parents in an array
    Child[] public children; // Store children in an array

    event ParentRegistered(address indexed parentAddress, bytes32 fullName);
    event ChildRegistered(address indexed childAddress, bytes32 fullName);

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function registerParent(
        string memory _fullName,
        string memory _email,
        string memory _phone,
        string memory _residentialAddress,
        uint16 _dob,
        string memory _govID,
        string memory _relationship,
        string memory _password
    ) public {
        require(bytes(_fullName).length > 0, "Full name is required");
        require(bytes(_email).length > 0, "Email is required");
        require(bytes(_phone).length > 0, "Phone number is required");
        require(bytes(_govID).length > 0, "GovID is required");
        require(_dob > 1900 && _dob <= 2024, "Invalid year of birth");

        parents.push(Parent({
            fullName: stringToBytes32(_fullName),
            email: _email,
            phone: _phone,
            residentialAddress: _residentialAddress,
            dob: _dob,
            govID: stringToBytes32(_govID),
            relationship: stringToBytes32(_relationship),
            passwordHash: keccak256(abi.encodePacked(_password)), // Hashing password
            walletAddress: msg.sender // Save MetaMask address
        }));
        emit ParentRegistered(msg.sender, stringToBytes32(_fullName));
    }

    function registerChild(
        string memory _fullName,
        uint16 _dob,
        string memory _gradeClass,
        string memory _studentID,
        string memory _password
    ) public {
        require(bytes(_fullName).length > 0, "Full name is required");
        require(bytes(_studentID).length > 0, "Student ID is required");
        require(_dob > 1900 && _dob <= 2024, "Invalid year of birth");

        children.push(Child({
            fullName: stringToBytes32(_fullName),
            dob: _dob,
            gradeClass: stringToBytes32(_gradeClass),
            studentID: stringToBytes32(_studentID),
            passwordHash: keccak256(abi.encodePacked(_password)), // Hashing password
            walletAddress: msg.sender // Save child's MetaMask address
        }));
        emit ChildRegistered(msg.sender, stringToBytes32(_fullName));
    }

    // Function to get the number of registered parents
    function getParentCount() public view returns (uint256) {
        return parents.length;
    }

    // Function to get the number of registered children
    function getChildCount() public view returns (uint256) {
        return children.length;
    }

    // Function to get a parent by index
    function getParent(uint256 index) public view returns (Parent memory) {
        require(index < parents.length, "Index out of bounds");
        return parents[index];
    }

    // Function to get a child by index
    function getChild(uint256 index) public view returns (Child memory) {
        require(index < children.length, "Index out of bounds");
        return children[index];
    }

    // Function to get all parents
    function getAllParents() public view returns (Parent[] memory) {
        return parents; // Return all parents
    }

    // Function to get all children
    function getAllChildren() public view returns (Child[] memory) {
        return children; // Return all children
    }

    // Login functions
    function loginParent(string memory _email, string memory _password) public view returns (bool) {
        for (uint256 i = 0; i < parents.length; i++) {
            if (keccak256(abi.encodePacked(parents[i].email)) == keccak256(abi.encodePacked(_email)) && 
                parents[i].passwordHash == keccak256(abi.encodePacked(_password))) {
                return true; // Valid login
            }
        }
        return false; // Invalid login
    }

    function loginChild(string memory _studentID, string memory _password) public view returns (bool) {
        for (uint256 i = 0; i < children.length; i++) {
            if (keccak256(abi.encodePacked(children[i].studentID)) == keccak256(abi.encodePacked(_studentID)) && 
                children[i].passwordHash == keccak256(abi.encodePacked(_password))) {
                return true; // Valid login
            }
        }
        return false; // Invalid login
    }
}
