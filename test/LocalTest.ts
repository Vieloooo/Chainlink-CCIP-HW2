import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CCIPLocalSimulator } from "../typechain-types";

describe("CCIP Cross Chain Name Service", function () {
    let ccipLocalSimualtorFactory: any, ccipLocalSimulator: CCIPLocalSimulator;
    let ccnsRegisterFactory: any, ccnsRegister: any;
    let ccnsServiceFactory: any, ccnsReceiver: any;
    let ccnsLookupFactory: any, ccnsLookup: any, ccnsLookup2: any;;

    /* 
        Deploy CCNS contract link to the source router (src-lookup <- Src-register -> router -> dst-receiver -> dst-lookup) 
    */
    before(async function () {
       
        // Deploy Bridge
        ccipLocalSimualtorFactory = await ethers.getContractFactory("CCIPLocalSimulator");
        ccipLocalSimulator = await ccipLocalSimualtorFactory.deploy();
        await ccipLocalSimulator.deployed();
        // Check bridge configs 
        const config = await ccipLocalSimulator.configuration();

        // as the Register/Reciever's deploy require the lookups' address. deploy lookup first. 
        // dst-lookup 
        ccnsLookupFactory = await ethers.getContractFactory("CrossChainNameServiceLookup");
        ccnsLookup = await ccnsLookupFactory.deploy();
        await ccnsLookup.deployed();

        // src-lookup 
        ccnsLookup2 = await ccnsLookupFactory.deploy();
        await ccnsLookup2.deployed();

        // src-register 
        ccnsRegisterFactory = await ethers.getContractFactory("CrossChainNameServiceRegister");
        // link the src-router and src-lookup address to the src-register contract
        ccnsRegister = await ccnsRegisterFactory.deploy(config.sourceRouter_, ccnsLookup2.address);
        await ccnsRegister.deployed();

        // dst-receiver
        ccnsServiceFactory = await ethers.getContractFactory("CrossChainNameServiceReceiver");
        ccnsReceiver = await ccnsServiceFactory.deploy(config.destinationRouter_, ccnsLookup.address, config.chainSelector_);
        await ccnsReceiver.deployed();

        // link the dst-receiver addr to the dst-lookup service 
        let res = await ccnsLookup.setCrossChainNameServiceAddress(ccnsReceiver.address);
        await res.wait();
        // link the src-register addr to the src-lookup service 
        res = await ccnsLookup2.setCrossChainNameServiceAddress(ccnsRegister.address);
        await res.wait();


        // enable the dst contract/chain for the src-register contract
        res = await ccnsRegister.enableChain(config.chainSelector_, ccnsReceiver.address, 500_000n);
        await res.wait();
        console.log("All setup done");
    });

    it("The alice's name should arrive the dst and src chain's lookup table", async function () {
        let alice: Signer;
        [, alice] = await ethers.getSigners();
        // register alice 's name on the src-register contract 
        let res = await ccnsRegister.connect(alice).register("alice.ccns");
        await res.wait();

        // look up alice.ccns 
        const dstCCNS = await ccnsLookup.lookup("alice.ccns");
        expect(dstCCNS).to.equal(await alice.getAddress());
        const srcCCNS = await ccnsLookup2.lookup("alice.ccns");
        expect(srcCCNS).to.equal(await alice.getAddress());
    });

});
