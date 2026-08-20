// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IResearchPackRegistry { function isCurrent(bytes32 assetId, bytes32 contentHash) external view returns (bool); }
interface IProductIdentityRegistry { function isCurrent(bytes32 productId, bytes32 rightsHash) external view returns (bool); }
interface IIntentCheckRegistry { function canProceed(bytes32 checkId, bool explicitOverride) external view returns (bool); }

contract ExecutionGuard {
    IResearchPackRegistry public immutable researchPacks;
    IProductIdentityRegistry public immutable products;
    IIntentCheckRegistry public immutable intentChecks;

    constructor(address researchPackRegistry, address productIdentityRegistry, address intentCheckRegistry) {
        researchPacks = IResearchPackRegistry(researchPackRegistry);
        products = IProductIdentityRegistry(productIdentityRegistry);
        intentChecks = IIntentCheckRegistry(intentCheckRegistry);
    }

    function validate(bytes32 assetId, bytes32 productId, bytes32 researchPackHash, bytes32 rightsHash, bytes32 intentCheckId, bool explicitMismatchOverride) external view returns (bool) {
        return researchPacks.isCurrent(assetId, researchPackHash)
            && products.isCurrent(productId, rightsHash)
            && intentChecks.canProceed(intentCheckId, explicitMismatchOverride);
    }
}
