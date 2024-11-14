const ParentChildRegistry = artifacts.require("TimeLock");



module.exports = function (deployer) {
  deployer.deploy(ParentChildRegistry);
};

