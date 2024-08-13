## Chainlink CCIP HW2

This repo write a simple test no cross-chain name space serivce. 

The homework site: https://cll-devrel.gitbook.io/ccip-bootcamp/v/mandarin-ccip-bootcamp/di-2-tian/di-2-tian-zuo-ye

This repo is forked from https://github.com/smartcontractkit/ccip-cross-chain-name-service/tree/main. 

You can run my test by: 

```bash 
# install hardhat and chainlink local simulator package through npm 
npm install 
# compile contracts 
npx hardhat compile 
# run the test 
npx hardhat test 
```

Then you can see the output: 
```
$ npx hardhat test


CCIP Cross Chain Name Service
All setup done
    ✔ The alice's name should arrive the dst and src chain's lookup table


  1 passing (718ms)
  ```
