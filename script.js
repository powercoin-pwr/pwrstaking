let web3;
let contract;
const contractAddress = "0x4936e0DFa40F5Ada61920d6Bbfd12D2BA88FfAe8";
const lpTokenAddress = "0xe5c56E4a8F8d96e3A91b18D83b7f0c36663C9a74";

const contractABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const lpTokenABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            { "name": "owner", "type": "address" },
            { "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        document.getElementById("walletAddress").innerText = `Connected: ${accounts[0]}`;
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract initialized:", contract);
    } else {
        alert("MetaMask not detected");
    }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);

const lpTokenContract = new web3.eth.Contract(lpTokenABI, lpTokenAddress);

document.getElementById("autoStakeButton").addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const stakeAmount = document.getElementById("stakeAmount").value;

    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }
    if (!stakeAmount || stakeAmount <= 0) {
        alert("Enter a valid stake amount.");
        return;
    }

    try {
        console.log("Approving LP Tokens...");
        alert("Approving LP Tokens...");
        const approvalTx = await lpTokenContract.methods.approve(contractAddress, web3.utils.toWei(stakeAmount, "ether")).send({ from: userAddress });
        console.log("Approval successful. Hash:", approvalTx.transactionHash);
        alert("Approval successful! Now stake manually.");
    } catch (error) {
        console.error("Approval failed:", error);
        alert(`Approval failed: ${error.message}`);
        return;
    }
});

document.getElementById("stakeButton").addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const stakeAmount = document.getElementById("stakeAmount").value;

    try {
        console.log("Checking allowance...");
        const allowance = await lpTokenContract.methods.allowance(userAddress, contractAddress).call();
        console.log("Allowance: ", allowance);

        if (BigInt(allowance) < BigInt(web3.utils.toWei(stakeAmount, "ether"))) {
            alert("Not enough allowance. Approve first.");
            return;
        }

        console.log("Sending stake transaction...");
        alert("Sending stake transaction...");
        const stakeTx = await contract.methods.stake(web3.utils.toWei(stakeAmount, "ether")).send({ from: userAddress, gas: 300000 });
        console.log("Stake Transaction Hash:", stakeTx.transactionHash);

        alert("Stake successful!");
    } catch (error) {
        console.error("Stake failed:", error);
        alert(`Stake failed: ${error.message}`);
    }
});

document.getElementById("unstakeButton").addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.unstake().send({ from: accounts[0] });
        alert("Unstake successful!");
    } catch (error) {
        console.error("Unstake failed:", error);
        alert("Unstake failed. Check console for details.");
    }
});

document.getElementById("claimRewardsButton").addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.claimRewards().send({ from: accounts[0] });
        alert("Rewards claimed successfully!");
    } catch (error) {
        console.error("Claiming rewards failed:", error);
        alert("Claiming rewards failed. Check console for details.");
    }
});

