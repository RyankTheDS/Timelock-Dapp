const ParentChildRegistry = artifacts.require("ParentChildRegistry");



module.exports = function (deployer) {
  deployer.deploy(ParentChildRegistry);
};

