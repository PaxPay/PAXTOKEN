/*
    FOR TESTERS:
    I used with ganache-cli -e 1000000000
 */
/* eslint-disable */
import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';
import moment from 'moment';

const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const Crowdsale = artifacts.require('./Crowdsale.sol');
const Token = artifacts.require('./PAXToken.sol');

contract('Crowdsale', function ([company, founders1, founders2, ...accounts]) {
    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    beforeEach(async function () {
        this.crowdsale = await Crowdsale.new(company, founders1, founders2);
    });

    describe('start', function () {
        beforeEach(async function () {
            await this.crowdsale.setStartDate(latestTime() + duration.minutes(1));
            await this.crowdsale.startICO();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            const tokenAddress = await this.crowdsale.token();
            this.token = await Token.at(tokenAddress);
            this.decimals = Math.pow(10, await this.token.decimals());
        });

        it('default settings && reserves', async function () {

            const [ companyTokens, founders1Tokens, founders2Tokens ] = await Promise.all([
                await this.token.balanceOf(company),
                await this.token.balanceOf(founders1),
                await this.token.balanceOf(founders2)
            ]);
            companyTokens.should.be.bignumber.equal(300000000 * this.decimals);
            founders1Tokens.should.be.bignumber.equal(300000000 * this.decimals);
            founders2Tokens.should.be.bignumber.equal(50000000 * this.decimals);
        });

        it('Getters\'n\'setters', async function () {

            let _multisig = accounts[0];

            await this.crowdsale.setMultisig(_multisig);

            const [
                multisig
            ] = await Promise.all([
                await this.crowdsale.multisig()
            ]);

            _multisig.should.be.equal(multisig);

        });
    });

    describe('before sales', function () {
        it('buy tokens before sale starts', async function () {

            await this.crowdsale.sendTransaction({ value: ether(1), from: accounts[0] }).should.be.rejected;

        });
    });

    describe('Check', function () {
        beforeEach(async function () {
            await this.crowdsale.setStartDate(latestTime() + duration.minutes(1));
            await this.crowdsale.startICO();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            const tokenAddress = await this.crowdsale.token();
            this.token = await Token.at(tokenAddress);
            this.decimals = Math.pow(10, await this.token.decimals());
        });

        it('Check stages', async function () {

            let stage = (await this.crowdsale.getStageId()).toNumber();
            let stageData = await this.crowdsale.getStageData();
            let stageLimit = +stageData[0];
            let stageBonus = +stageData[1];
            let limit = 44500000 * Math.pow(10, 10);
            stage.should.be.equal(0);
            stageLimit.should.be.equal(limit);
            stageBonus.should.be.equal(130);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            stage = (await this.crowdsale.getStageId()).toNumber();
            stageData = await this.crowdsale.getStageData();
            stageLimit = +stageData[0];
            stageBonus = +stageData[1];
            limit += 85000000 * Math.pow(10, 10);
            stage.should.be.equal(1);
            stageLimit.should.be.equal(limit);
            stageBonus.should.be.equal(115);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            stage = (await this.crowdsale.getStageId()).toNumber();
            stageData = await this.crowdsale.getStageData();
            stageLimit = +stageData[0];
            stageBonus = +stageData[1];
            limit += 100000000 * Math.pow(10, 10);
            stage.should.be.equal(2);
            stageLimit.should.be.equal(limit);
            stageBonus.should.be.equal(110);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            stage = (await this.crowdsale.getStageId()).toNumber();
            stageData = await this.crowdsale.getStageData();
            stageLimit = +stageData[0];
            stageBonus = +stageData[1];
            limit += 120000000 * Math.pow(10, 10);
            stage.should.be.equal(3);
            stageLimit.should.be.equal(limit);
            stageBonus.should.be.equal(105);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            stage = (await this.crowdsale.getStageId()).toNumber();
            stageData = await this.crowdsale.getStageData();
            stageLimit = +stageData[0];
            stageBonus = +stageData[1];
            stage.should.be.equal(4);
            stageLimit.should.be.equal(limit);
            stageBonus.should.be.equal(100);

        });

    });

    describe('ICO-1', function () {
        beforeEach(async function () {
            await this.crowdsale.setStartDate(latestTime() + duration.minutes(1));
            await this.crowdsale.startICO();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            const tokenAddress = await this.crowdsale.token();
            this.token = await Token.at(tokenAddress);
            this.decimals = Math.pow(10, await this.token.decimals());
        });

        it('Change stages by time, sumWei, totalSold, stop, refund', async function () {
            let assertedEther = 0;
            let assertedToken = 0;

            let buyer = accounts[0];
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer });
            let myBalance = await this.token.balanceOf(buyer);
            let assertedValue = 6500;
            assertedEther += ether(1).toNumber();
            assertedToken += +assertedValue;
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[1];
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.fulfilled;
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer });
            myBalance = await this.token.balanceOf(buyer);
            assertedValue = 5750;
            assertedEther += ether(1).toNumber();
            assertedToken += +assertedValue;
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[2];
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.fulfilled;
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer });
            myBalance = await this.token.balanceOf(buyer);
            assertedValue = 5500;
            assertedEther += ether(1).toNumber();
            assertedToken += +assertedValue;
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[3];
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.fulfilled;
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer });
            myBalance = await this.token.balanceOf(buyer);
            assertedValue = 5250;
            assertedEther += ether(1).toNumber();
            assertedToken += +assertedValue;
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[4];
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.fulfilled;
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer });
            myBalance = await this.token.balanceOf(buyer);
            assertedValue = 5000;
            assertedEther += ether(1).toNumber();
            assertedToken += +assertedValue;
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            let expectedEther = await this.crowdsale.sumWei();
            expectedEther.should.be.bignumber.equal(assertedEther);

            let expectedToken = await this.crowdsale.totalSold();
            expectedToken = Math.round(expectedToken / this.decimals, 5);
            expectedToken.should.be.bignumber.equal(assertedToken);

            await this.crowdsale.stopICO();
            let state = await this.crowdsale.state();
            state.should.be.equal(false);

            let buyerPreBalance = web3.eth.getBalance(accounts[1]);
            buyerPreBalance = Math.round(buyerPreBalance.add(ether(1)) / Math.pow(10, 18), 5);
            await this.crowdsale.refund({from: accounts[1]});
            let buyerPostBalance = web3.eth.getBalance(accounts[1]);
            buyerPostBalance = Math.round(buyerPostBalance / Math.pow(10, 18), 5);
            buyerPreBalance.should.be.bignumber.equal(buyerPostBalance);

        });

    });

    describe('ICO-2', function () {
        beforeEach(async function () {
            await this.crowdsale.setStartDate(latestTime() + duration.minutes(1));
            await this.crowdsale.startICO();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            const tokenAddress = await this.crowdsale.token();
            this.token = await Token.at(tokenAddress);
            this.decimals = Math.pow(10, await this.token.decimals());
        });

        it('Change stages by sold value, stop, burn, withDrawal', async function () {

            let buyer = accounts[0];
            let buy = (await this.crowdsale.calculateStagePrice()).toNumber();
            await this.crowdsale.sendTransaction({ value: buy, from: buyer });

            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await this.token.transfer(accounts[1], 1E10, { from: buyer }).should.be.rejected;
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));

            buyer = accounts[1];
            buy = (await this.crowdsale.calculateStagePrice()).toNumber();
            await this.crowdsale.sendTransaction({ value: buy, from: buyer });

            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));

            buyer = accounts[2];
            buy = (await this.crowdsale.calculateStagePrice()).toNumber();
            await this.crowdsale.sendTransaction({ value: buy, from: buyer });

            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await this.crowdsale.unpause();
            await increaseTimeTo(latestTime() + duration.minutes(10));

            buyer = accounts[3];
            buy = (await this.crowdsale.calculateStagePrice()).toNumber();
            await this.crowdsale.sendTransaction({ value: buy, from: buyer });

            let etherBalance = web3.eth.getBalance(this.crowdsale.address);

            await this.crowdsale.setMultisig(accounts[4]);
            let multisig = await this.crowdsale.multisig();
            let multisigBalance = web3.eth.getBalance(multisig);
            etherBalance = etherBalance.add(multisigBalance);

            await this.crowdsale.stopICO();
            let state = await this.crowdsale.state();
            state.should.be.equal(false);

            await this.crowdsale.burnUnsoldTokens();
            let isBurned = await this.crowdsale.isBurned();
            isBurned.should.be.equal(true);
            let tokenBalance = await this.token.balanceOf(this.crowdsale.address);
            tokenBalance.should.be.bignumber.equal(0);

            await this.crowdsale.withDrawal();
            multisigBalance = web3.eth.getBalance(multisig);
            multisigBalance.should.be.bignumber.equal(etherBalance);

            //true.should.be.equal(false);
        });

    });

    describe('ICO-3', function () {
        beforeEach(async function () {
            await this.crowdsale.setStartDate(latestTime() + duration.minutes(1));
            await this.crowdsale.startICO();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            const tokenAddress = await this.crowdsale.token();
            this.token = await Token.at(tokenAddress);
            this.decimals = Math.pow(10, await this.token.decimals());
        });

        it('Manual pause, buy all of the tokens', async function () {

            let buyer = accounts[0];

            await this.crowdsale.pause();
            await this.crowdsale.sendTransaction({ value: ether(1), from: buyer }).should.be.rejected;
            await increaseTimeTo(latestTime() + duration.minutes(10));
            await this.crowdsale.unpause();

            let myPreEtherBalance = web3.eth.getBalance(buyer);

            await this.crowdsale.sendTransaction({ value: ether(100000), from: buyer });

            let crEtherBalance = web3.eth.getBalance(this.crowdsale.address);
            myPreEtherBalance = Math.round(myPreEtherBalance.sub(crEtherBalance) / Math.pow(10, 18), 5);

            let myTokenBalance = await this.token.balanceOf(buyer);
            let myPostEtherBalance = Math.round(web3.eth.getBalance(buyer) / Math.pow(10, 18), 5);

            let assertedValue = 349500000;

            myTokenBalance = Math.round(myTokenBalance / this.decimals, 5);
            myTokenBalance.should.be.bignumber.equal(assertedValue);
            myPreEtherBalance.should.be.equal(myPostEtherBalance);

        });

    });

    describe('ICO-4', function () {
        beforeEach(async function () {
            await this.crowdsale.setStartDate(latestTime() + duration.minutes(1));
            await this.crowdsale.startICO();
            await increaseTimeTo(latestTime() + duration.minutes(10));
            const tokenAddress = await this.crowdsale.token();
            this.token = await Token.at(tokenAddress);
            this.decimals = Math.pow(10, await this.token.decimals());
        });

        it('manualSendTokens, sumWei, totalSold, stop', async function () {
            let assertedEther = 0;
            let assertedToken = 0;

            let buyer = accounts[0];
            let assertedValue = 5000 * this.decimals;
            await this.crowdsale.manualSendTokens(buyer, assertedValue);
            let myBalance = await this.token.balanceOf(buyer);
            assertedEther += ether(1).toNumber();
            assertedToken += +assertedValue;
            assertedValue = Math.round(assertedValue / this.decimals, 5);
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[1];
            assertedValue = 10000 * this.decimals;
            await this.crowdsale.manualSendTokens(buyer, assertedValue);
            myBalance = await this.token.balanceOf(buyer);
            assertedEther += ether(2).toNumber();
            assertedToken += +assertedValue;
            assertedValue = Math.round(assertedValue / this.decimals, 5);
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[2];
            assertedValue = 15000 * this.decimals;
            await this.crowdsale.manualSendTokens(buyer, assertedValue);
            myBalance = await this.token.balanceOf(buyer);
            assertedEther += ether(3).toNumber();
            assertedToken += +assertedValue;
            assertedValue = Math.round(assertedValue / this.decimals, 5);
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[3];
            assertedValue = 20000 * this.decimals;
            await this.crowdsale.manualSendTokens(buyer, assertedValue);
            myBalance = await this.token.balanceOf(buyer);
            assertedEther += ether(4).toNumber();
            assertedToken += +assertedValue;
            assertedValue = Math.round(assertedValue / this.decimals, 5);
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            await increaseTimeTo(latestTime() + duration.weeks(2));
            buyer = accounts[4];
            assertedValue = 25000 * this.decimals;
            await this.crowdsale.manualSendTokens(buyer, assertedValue);
            myBalance = await this.token.balanceOf(buyer);
            assertedEther += ether(5).toNumber();
            assertedToken += +assertedValue;
            assertedValue = Math.round(assertedValue / this.decimals, 5);
            myBalance = Math.round(myBalance / this.decimals, 5);
            myBalance.should.be.bignumber.equal(assertedValue);

            let expectedEther = await this.crowdsale.sumWei();
            expectedEther.should.be.bignumber.equal(assertedEther);

            let expectedToken = await this.crowdsale.totalSold();
            expectedToken.should.be.bignumber.equal(assertedToken);

            await this.crowdsale.stopICO();
            let state = await this.crowdsale.state();
            state.should.be.equal(false);

        });
    });

});
