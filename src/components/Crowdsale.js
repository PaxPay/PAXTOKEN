import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Input, Button } from 'reactstrap';
import moment from 'moment';

import '../css/Crowdsale.css';

const dateFormat = 'D.MM.YYYY, HH:mm:ss';

class Crowdsale extends Component {
  constructor(props) {
    super(props);

    this.state = {
      owner: '',
      multisig: '',
      decimals: 0,

      preICO: {
        start: '',
        stop: '',
        duration: '',
        bonus: '',
        limit: '',
      },

      tier1: {
        start: '',
        stop: '',
        duration: '',
        bonus: '',
        limit: '',
      },

      tier2: {
        start: '',
        stop: '',
        duration: '',
        bonus: '',
        limit: '',
      },

      tier3: {
        start: '',
        stop: '',
        duration: '',
        bonus: '',
        limit: '',
      },

      ICO: {
        start: '',
        period: '',
        softcap: '',
        hardcap: '',
        rate: '',
        tokensAmount: '',
        totalSold: '',
        sumWei: '',
        company: '',
        founders_1: '',
        founders_2: '',
        paused: false,
      },

      // ICO
      state: false,
      requireOnce: false,
      isBurned: false,

      newOwner: '',
      newMultisig: '',
      newStartDate: '',
      address: '',
      valueTokens: '',
      company_: '',
      founders_one: '',
      founders_two: '',
    };
  }

  async componentWillMount() {
    const { instanceCrowdsale } = this.props;

    const [
      softcap,
      hardcap,
      decimals,
      multisig,
      owner,
      company,
      founders_1,
      founders_2,
      periods,
      rate,
      totalSold,
      sumWei,
      state,
      requireOnce,
      isBurned,
      paused,
    ] = await Promise.all([
      instanceCrowdsale.softcap.call(),
      instanceCrowdsale.hardcap.call(),
      instanceCrowdsale.decimals.call(),
      instanceCrowdsale.multisig.call(),
      instanceCrowdsale.owner.call(),
      instanceCrowdsale.company.call(),
      instanceCrowdsale.founders_1.call(),
      instanceCrowdsale.founders_2.call(),
      instanceCrowdsale.period.call(),
      instanceCrowdsale.rate.call(),
      instanceCrowdsale.totalSold.call(),
      instanceCrowdsale.sumWei.call(),
      instanceCrowdsale.state.call(),
      instanceCrowdsale.requireOnce.call(),
      instanceCrowdsale.isBurned.call(),
      instanceCrowdsale.paused.call(),
    ]);

    const [
        _preICO,
    ] = await Promise.all([
        instanceCrowdsale.stages.call(0),
    ]);

      const preICO = {
        start: _preICO[0],
        stop: _preICO[1],
        duration: _preICO[2],
        bonus: _preICO[3],
        limit: _preICO[4],
      };

      let period = '';

      switch (periods.toNumber()) {
        case 0:
          period = "Pre-ICO";
          break;
        case 1:
          period = "Tier 1";
          break;
        case 2:
          period = "Tier 2";
          break;
        case 3:
          period = "Tier 3";
          break;
        default:
          period = "Unknown";
          break;
      }

      const ICO = {
        softcap: softcap.toNumber(),
        hardcap: +hardcap / +decimals,
        rate: rate.toNumber(),
        tokensAmount: 0,
        totalSold: totalSold.toNumber(),
        sumWei: sumWei.toNumber(),
        period: period,
        start: preICO.start,
        company: company,
        founders_1: founders_1,
        founders_2: founders_2,
        paused: paused,
        };

      this.setState({
        preICO,
        ICO,
        state,
        requireOnce,
        isBurned,
        multisig,
        owner,
    });


    if (state) {
        const [
            tokensAmount,
        ] = await Promise.all([
            instanceCrowdsale.tokensAmount.call(),
        ]);

        const ICO = this.state.ICO;
        ICO.tokensAmount = tokensAmount.toNumber();

        this.setState({
            ICO,
        });
    }
  }

  async feasibility(callback, args) {
    try {
      await callback.apply(this, args);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async crowdsaleTransferOwnership() {
    const { web3, instanceCrowdsale } = this.props;
    const { newOwner } = this.state;

    let isAddress = web3.isAddress(newOwner);

    if (isAddress) {
      if (await this.feasibility(instanceCrowdsale.transferOwnership, [
        newOwner, { from: web3.eth.accounts[0], gas: 100000 }
      ])) {
        const owner = await instanceCrowdsale.owner.call();
        this.setState({ owner });
      }
    } else {
      alert(`not Valid!`);
    }

  }

  async crowdsaleChangeWallet() {
    const { web3, instanceCrowdsale } = this.props;
    const { newMultisig } = this.state;

    let isAddress = web3.isAddress(newMultisig);

    if (isAddress) {
      if (await this.feasibility(instanceCrowdsale.setMultisig, [
        newMultisig, { from: web3.eth.accounts[0], gas: 100000 }
      ])) {
        const multisig = await instanceCrowdsale.multisig.call();
        this.setState({ multisig });
      }
    } else {
      alert(`is not Valid!`);
    }

  }

  async pause() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.pause, [{ from: web3.eth.accounts[0], gas: 1000000 }])) {
      const [
          state,
          paused
      ] = await Promise.all([
          instanceCrowdsale.state.call(),
          instanceCrowdsale.paused.call(),
      ]);
      this.setState({ state, paused });
    }
  }

  async unpause() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.unpause, [{ from: web3.eth.accounts[0], gas: 1000000 }])) {
      const [
          state,
          paused
      ] = await Promise.all([
          instanceCrowdsale.state.call(),
          instanceCrowdsale.paused.call(),
      ]);
      this.setState({ state, paused });
    }
  }

  async startICO() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.startICO, [{ from: web3.eth.accounts[0], gas: 1000000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async withDrawal() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.withDrawal, [{ from: web3.eth.accounts[0], gas: 100000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async setStartDate() {
      const { web3, instanceCrowdsale } = this.props;
      const { ICO, newStartDate } = this.state;

      let date = moment.unix(newStartDate);

      if (date.isValid()) {
          if (await this.feasibility(instanceCrowdsale.setStartDate, [
                  newStartDate, { from: web3.eth.accounts[0], gas: 300000 }
              ])) {
              const start = await instanceCrowdsale.stages(0);
              ICO.start = start[0];

              this.setState({ ICO });
          }
      } else {
          alert(`${newStartDate} is not Unix Timestamp!`);
      }
  }

  async manualSendTokens() {
    const { web3, instanceCrowdsale } = this.props;
    const { address } = this.state;
    let { valueTokens } = this.state;
           valueTokens  *= 10 ** 10;
    let isAddress = web3.isAddress(address);

    if (isAddress) {
      if (await this.feasibility(instanceCrowdsale.manualSendTokens, [
        address, valueTokens, { from: web3.eth.accounts[0], gas: 1000000 }
      ]));
    } else {
      alert(`is not Valid!`);
    }

  }

  async stopICO() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.stopICO, [{ from: web3.eth.accounts[0], gas: 100000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async burnUnsoldTokens() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.burnUnsoldTokens, [{ from: web3.eth.accounts[0], gas: 100000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async setReserveForCompany() {
    const { web3, instanceCrowdsale } = this.props;
    const { company_ } = this.state;

    let isAddress = web3.isAddress(company_);

    if (isAddress) {
      if (await this.feasibility(instanceCrowdsale.setReserveForCompany, [
        company_, { from: web3.eth.accounts[0], gas: 100000 }
      ]));
    } else {
      alert(`is not Valid!`);
    }

  }

  async setReserveForFoundersFirst() {
    const { web3, instanceCrowdsale } = this.props;
    const { founders_one } = this.state;

    let isAddress = web3.isAddress(founders_one);
    if (isAddress) {
      if (await this.feasibility(instanceCrowdsale.setReserveForFoundersFirst, [
        founders_one, { from: web3.eth.accounts[0], gas: 100000 }
      ]));
    } else {
      alert(`is not Valid!`);
    }

  }

  async setReserveForFoundersSecond() {
    const { web3, instanceCrowdsale } = this.props;
    const { founders_two } = this.state;

    let isAddress = web3.isAddress(founders_two);

    if (isAddress) {
      if (await this.feasibility(instanceCrowdsale.setReserveForFoundersSecond, [
        founders_two, { from: web3.eth.accounts[0], gas: 100000 }
      ]));
    } else {
      alert(`is not Valid!`);
    }

  }

  splitString = str => str.replace(/\s/g, '').split(',');

  render() {
    const { instanceCrowdsale, divider } = this.props;
    const {
      owner, multisig, ICO, state, requireOnce, isBurned,
      newOwner, newMultisig, newStartDate, address, valueTokens, company_, founders_one, founders_two
    } = this.state;
    return (
      <Row style={{ marginTop: 50 }}>
        <Col>
          <Row><h3>Crowdsale</h3></Row>
            <Row>
                <Col md={{ size: 6 }}>
                  <Row>Owner: {owner}</Row>
                  <Row>Wallet: {multisig}</Row>
                  <Row>Address: {instanceCrowdsale.address}</Row>
                </Col>
                <Col md={{ size: 6 }}>
                  <Row>Company: {ICO.company}</Row>
                  <Row>Founders #1: {ICO.founders_1}</Row>
                  <Row>Founders #2: {ICO.founders_2}</Row>
                </Col>
            </Row>
          <hr className="my-2" />

          <Row>
            <Col>
              <Row><h5>ICO</h5></Row>
              <Row>Token cost: {(ICO.rate / 1E18).toFixed(4).toLocaleString()} ETH</Row>
              <Row>Hard cap: {(ICO.hardcap / divider ).toLocaleString()} PAX</Row>
              <Row>Tokens sold: {(ICO.totalSold / 1E10).toLocaleString()} PAX</Row>
              <Row>Tokens left: {(ICO.tokensAmount / 1E10).toLocaleString()} PAX</Row>
              <Row>Raised Eth: {(ICO.sumWei / 1E18).toLocaleString()} ETH</Row>
              <Row>Start ICO: { moment.unix(ICO.start).format(dateFormat) }</Row>
              <Row>Period: {ICO.period}</Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Management</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15, flexWrap: 'nowrap'}}>
              <Col md={{ size: 3 }}>
                <Row className="funcLabel">State: {(!state)?"Stopped":(ICO.paused)?"Paused":"Active"}</Row>
              </Col>
              <Col md={{ size: 3 }}>
                  <Button className="funcButton" disabled={!state || ICO.paused} color="info" onClick={() => this.pause()}>Pause</Button>
              </Col>
              <Col md={{ size: 3 }}>
                  <Button className="funcButton" disabled={!state || !ICO.paused} color="info" onClick={() => this.unpause()}>Unpause</Button>
              </Col>
              <Col md={{ size: 3 }}>
                  <Button className="funcButton" disabled={+ICO.sumWei < +ICO.softcap} color="success" onClick={() => this.withDrawal()}>Withdrawal</Button>
              </Col>
          </Row>
          <Row className="funcRow" style={{ marginBottom: 15, flexWrap: 'nowrap'}}>
            <Col md={{ size: 3 }}>
            </Col>
            <Col md={{ size: 3 }}>
              <Button className="funcButton" disabled={!requireOnce} color="info" onClick={() => this.startICO()}>Start ICO</Button>
            </Col>
            <Col md={{ size: 3 }}>
              <Button className="funcButton" disabled={!state} color="info" onClick={() => this.stopICO()}>Stop ICO</Button>
            </Col>
            <Col md={{ size: 3 }}>
                <Button className="funcButton" disabled={(state || isBurned) || requireOnce} color="danger" onClick={() => this.burnUnsoldTokens()}>Burn Unsold</Button>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Ownership</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Transfer ownership of crowdsale</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={newOwner}
                onChange={e => this.setState({ newOwner: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Address of new Owner"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info" onClick={() => this.crowdsaleTransferOwnership()}>Transfer Ownership</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Wallet</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Change wallet</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={newMultisig}
                onChange={e => this.setState({ newMultisig: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Address of new wallet"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info" onClick={() => this.crowdsaleChangeWallet()}>Change Wallet</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Start Date</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Set Start Date</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={newStartDate}
                onChange={e => this.setState({ newStartDate: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Start date"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" disabled={state} color="info" onClick={() => this.setStartDate()}>Set Date</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Manual Sending</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Manual Sending</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={address}
                onChange={e => this.setState({ address: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Address"
              />
              <Input
                value={valueTokens}
                onChange={e => this.setState({ valueTokens: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Tokens value"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" disabled={!state} color="info" onClick={() => this.manualSendTokens()}>Send</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15}}><h5>Wallet for company: </h5>
          </Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">300000000 PAX</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={company_}
                onChange={e => this.setState({ company_: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder={ICO.company}
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info"  disabled={state} onClick={() => this.setReserveForCompany()}>Change Wallet</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Wallet for first founders</h5>
          </Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">300000000 PAX</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={founders_one}
                onChange={e => this.setState({ founders_one: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder={ICO.founders_1}
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info"  disabled={state} onClick={() => this.setReserveForFoundersFirst()}>Change Wallet</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Wallet for second founders</h5>
          </Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">50000000 PAX</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={founders_two}
                onChange={e => this.setState({ founders_two: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder={ICO.founders_2}
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info"  disabled={state} onClick={() => this.setReserveForFoundersSecond()}>Change Wallet</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

        </Col>
      </Row>
    );
  }
}

Crowdsale.propTypes = {
  web3: PropTypes.shape({
    toWei: PropTypes.func.isRequired,
    eth: PropTypes.shape({
      accounts: PropTypes.array.isRequired
    })
  }).isRequired,
  instanceCrowdsale: PropTypes.shape({
    stages: PropTypes.func.isRequired,
    balances: PropTypes.func.isRequired,
    softcap: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
    multisig: PropTypes.func.isRequired,
    decimals: PropTypes.func.isRequired,

    // Other
    owner: PropTypes.func.isRequired,
    company: PropTypes.func.isRequired,
    founders_1: PropTypes.func.isRequired,
    founders_2: PropTypes.func.isRequired,

    // ICO
    period: PropTypes.func.isRequired,
    hardcap: PropTypes.func.isRequired,
    rate: PropTypes.func.isRequired,
    totalSold: PropTypes.func.isRequired,
    sumWei: PropTypes.func.isRequired,
    state: PropTypes.func.isRequired,
    requireOnce: PropTypes.func.isRequired,
    isBurned: PropTypes.func.isRequired,
    paused: PropTypes.func.isRequired,
    tokensAmount: PropTypes.func.isRequired,

    // Functions
    startICO: PropTypes.func.isRequired,
    stopICO: PropTypes.func.isRequired,
    burnUnsoldTokens: PropTypes.func.isRequired,
    setMultisig: PropTypes.func.isRequired,

  }).isRequired,
  divider: PropTypes.number.isRequired
};

export default Crowdsale;
