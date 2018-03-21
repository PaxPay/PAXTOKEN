## PAX Token Crowdsale

### Easy install on local machine

To work you will need a [npm](https://www.npmjs.com/get-npm),
[truffle](http://truffleframework.com/) and
[Metamask](https://metamask.io/)

####  In first terminal run

```bash
git clone https://github.com/PaxPay/PAXTOKEN.git
cd ./PAXTOKEN
npm i
truffle develop
```

#### In another terminal run

```bash
cd ./PAXTOKEN
chmod +x ./compile_n_start.sh
./compile_n_start.sh
```

#### In browser

1. Log in Metamask
2. Import the first private key from the first terminal in the Metamask
account
3. Add custom RPC http://localhost:9545/
4. Go to http://localhost:3000/
5. Profit!
