<div align="center">
  <h1>
  Reputation Insignias
  </h1>
  by Pelenia (formerly PELE Network)
</div>

## I. About Reputation Insignias

Reputation insignias allow users to prove their credibility in a community or DAO. They can enhance governance, improve user networking, or simply reduce spam.  Insignias are manually issued to community members who have accomplished an achievement, and can also manage treasuries.

## II. Abstract

This repo defines a minimum interface for an insignia smart contract. 

Currently, insignias can manage the dispersement of treasury funds (pluggable with ZRC-4), the submission and/or voting of governance proposals, and the issuance of other insignias.

## III. Motivation

A standard for insignias can serve as an interface for developers and organizations to manage accessibility to resources such as a treasury. The insignia can be used to prevent misuse of a DAO.

Insignia issuance is initially handled by the smart contract owner; once a high-level insignia has been issued and accepted by another wallet, insignia issuance becomes democratic: a 2/3 majority of insignia holders must approve before issuance of an insignia to a new wallet.

## IV. Register New Insignia

Insignia templates (i.e. bronze, silver, gold) must be added to the contract before an insignia can be issued. 

1. Register name and metadata url of insignia template (i.e. bronze, silver, gold)
2. After registration, choose governance parameters for proposals (if holders can submit and/or vote on proposals). A signature will be required per parameter.

## V. Issue or Request Insignia

 Insignias can be requested by wallets or issued by managers (i.e. gold insignia holders). All insignias must be approved by the recipient to finalize issuance.

1. Insignia is requested by wallet (signature required) or issued by manager.
2. Other holders of the insignia vote for/against.
3. Upon 2/3 majority, receiving wallet must approve issuance.
4. Insignia is then issued to recipient.

## VI. Treasury

Included in this repo is a slightly modified ZRC-4 multisig wallet that can act as a compatible treasury.

Currently, the Reputation Insignias contract only supports one treasury. 

## VII. Specification

The insignia contract specification describes:

1. the global error codes to be declared in the library part of the contract;
2. the names and types of the immutable and mutable variables (aka `fields`);
3. the transitions that will allow the changing of values of the mutable variables;
4. the events to be emitted by them.

### A. Error Codes

The multisig contract define the following constants for use as error codes for the `Error` event.

| Name                            | Type    | Code   | Description                                                                                                                                 |
| ------------------------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodeNotOwner`                  | `Int32` |  `-1`  | Emit when a non-owner attempts to take part in DAO.                                                                                         |
| `CodeNonePendingOwner`          | `Int32` |  `-2`  | Emit when a pending owner whose smart contract ownership cannot be found.                                                                   |
| `CodeNotPendingOwner`           | `Int32` |  `-3`  | Emit when a pending owner is not matched.                                                                                                   |
| `CodeInsigniaTemplateNotFound`  | `Int32` |  `-4`  | Emit when a insignia template cannot be found.                                                                                              |
| `CodeInsigniaTemplateExists`    | `Int32` |  `-5`  | Emit when a insignia template is alreay exist.                                                                                              |
| `CodeInsigniaNotFound`          | `Int32` |  `-6`  | Emit when a issued insignia object cannot be found.                                                                                         |
| `CodeIssuePendingNotFound`      | `Int32` |  `-7`  | Emit when a pending insignia object cannot be found.                                                                                        |
| `CodeIssuePendingInvalid`       | `Int32` |  `-8`  | Emit when a pending insignia object is not approved.                                                                                        |
| `CodeIssueNotVoted`             | `Int32` |  `-9`  | Emit when a pending insignia object is not voted.                                                                                           |
| `CodeInvalidSigner`             | `Int32` | `-10`  | Emit when a sender who don't have access to issue insignia attempt to issue insignia.                                                       |
| `CodeInvalidSignature`          | `Int32` | `-11`  | Emit when a issue insignia signature is not valid.                                                                                          |
| `CodeInvalidTreasuryWallet`     | `Int32` | `-12`  | Emit when a ZRC4 address is not registered to smart contract.                                                                               |

### B. Immutable Variables

| Name                     | Type           | Description                                                                                                    |
| ------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `initial_contract_owner` | `ByStr20`      | Address of contract owner. It must not be the zero address i.e., `0x0000000000000000000000000000000000000000`. |

### C. Mutable Fields

| Name                  | Type                                    | Description                                                                                                                                                                     |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract_owner`      | `ByStr20`                               | Address of the contract owner. `contract_owner` defaults to `initial_contract_owner`. |
| `pending_owner`       | `Option ByStr20`                        | Address of the pending contract owner. |
| `treasury_address`    | `Option ByStr20`                        | Address of the ZRC4. |
| `insignia_templates`  | `Map Uint32 InsigniaTemplate`           | Mapping of template id to a template object. A template object include template name(String), template metadata url(String), last issued insignia id(Uint128), total number of issued insignia(Uint128) |
| `treasury_access`     | `Map Uint32 Bool`                       | Mapping of template id to a boolean. True indicates an owner of treasury wallet. |
| `proposal_access`     | `Map Uint32 Bool`                       | Mapping of template id to a boolean. True indicates an person who can make proposal. |
| `vote_access`         | `Map Uint32 Bool`                       | Mapping of template id to a boolean. True indicates an person who can vote to proposal. |
| `issue_access`        | `Map Uint32 Bool`                       | Mapping of template id to a boolean. True indicates an person who can vote to issue insignia. |
| `insignia_owners`     | `Map Uint32 (Map Uint128 ByStr20)`      | Mapping of insignia template id to insignia owner by the insignia id. |
| `insignia_pending`    | `Map Uint32 (Map ByStr20 IssuePending)` | Mapping of insignia template id to insignia pending object by the insignia id. Pending object include 2 boolean values - voted and approved. Both of them are true, insignia can be issued to candidate. |

### D. Interface Transitions

#### 1. SubmitTransaction()

```
(* @dev: Issue a insignia to a candidate. Map of insignia holders if their request is valid *)
transition IssueInsignia(
  pubkey: ByStr33,
  sender_template_id: Uint32,
  sender_insignia_id: Uint128,
  candidate: ByStr20,
  template_id: Uint32,
  signature: ByStr64
)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `pubkey` | `ByStr33` | Public Key of the request issue insignia. |
| `sender_template_id` | `Uint32` | Insignia template ID of request sender. |
| `sender_insignia_id` | `Uint128` | Insignia ID of request sender. |
| `candidate` | `ByStr20` | Address whose be issued insignia. |
| `template_id` | `Uint32` | Insignia template id whose be issued insignia. |
| `signature` | `ByStr64` | The signature of the cheque by requester to authorize issue. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `IssueInsigniaSuccess` | Requst of issue insignia is registerd. | <ul><li>`candidate` : `ByStr20`<br/>Candidate address who will be received insignia.</li><li>`template_id` : `Uint32`<br/>Insignia template id that will be issued.</li></ul> |
| `_eventname` | `Error` | Requst of issue insignia is failed. | <ul><li>Emit `CodeInvalidSignature` if issue signature is invalid. </li><li>Emit `CodeInvalidSigner` if sender has no accessibility.</li><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered.</li></ul> |

#### 2. VoteIssue()

```
(* @dev: Vote a insignia to a candidate. Only Gold insignia holder can vote to issue insignia. *)
transition VoteIssue(
  pubkey: ByStr33,
  sender_template_id: Uint32,
  sender_insignia_id: Uint128,
  candidate: ByStr20,
  template_id: Uint32,
  signature: ByStr64
)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `pubkey` | `ByStr33` | Public Key of the request issue insignia. |
| `sender_template_id` | `Uint32` | Insignia template ID of request sender. |
| `sender_insignia_id` | `Uint128` | Insignia ID of request sender. |
| `candidate` | `ByStr20` | Address whose be issued insignia. |
| `template_id` | `Uint32` | Insignia template id whose be issued insignia. |
| `signature` | `ByStr64` | The signature of the cheque by requester to authorize issue. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `VoteIssueSuccess` | Vote to issue insignia is successes. | <ul><li>`candidate` : `ByStr20`<br/>Candidate address who will be received insignia.</li><li>`template_id` : `Uint32`<br/>Insignia template id that will be issued.</li></ul> |
| `_eventname` | `Error` | Vote to issue insignia is failed. | <ul><li>Emit `CodeInvalidSignature` if issue signature is invalid. </li><li>Emit `CodeInsigniaNotFound` if sender has no accessibility.</li><li>Emit `CodeIssuePendingNotFound` if the insignia pending object is not registered.</li></ul> |

#### 3. AgainstIssue()

```
(* @dev: Against issue a insignia to a candidate. Only Gold insignia holder can against to issue insignia. *)
transition AgainstIssue(
  pubkey: ByStr33,
  sender_template_id: Uint32,
  sender_insignia_id: Uint128,
  candidate: ByStr20,
  template_id: Uint32,
  signature: ByStr64
)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `pubkey` | `ByStr33` | Public Key of the request issue insignia. |
| `sender_template_id` | `Uint32` | Insignia template ID of request sender. |
| `sender_insignia_id` | `Uint128` | Insignia ID of request sender. |
| `candidate` | `ByStr20` | Address whose be issued insignia. |
| `template_id` | `Uint32` | Insignia template id whose be issued insignia. |
| `signature` | `ByStr64` | The signature of the cheque by requester to authorize issue. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `AgainstIssueSuccess` | Against to issue insignia is successes. | <ul><li>`candidate` : `ByStr20`<br/>Candidate address who will be received insignia.</li><li>`template_id` : `Uint32`<br/>Insignia template id that will be issued.</li></ul> |
| `_eventname` | `Error` | Against to issue insignia is failed. | <ul><li>Emit `CodeInvalidSignature` if issue signature is invalid. </li><li>Emit `CodeInsigniaNotFound` if sender has no accessibility.</li><li>Emit `CodeIssuePendingNotFound` if the insignia pending object is not registered.</li></ul> |

#### 4. ApproveIssueInsignia()

```
(* Approve to issue insignia after it is voted *)
procedure ApproveIssueInsignia(template_id: Uint32, candidate: ByStr20)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id whose be issued insignia. |
| `candidate` | `ByStr20` | Address whose be issued insignia. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `MintInsigniaSuccess` | Vote to issue insignia is registerd. | <ul><li>`template_id` : `Uint32`<br/>Insignia template id that will be issued.</li><li>`insignia_id` : `Uint128`<br/>Insignia id that will be issued.</li></ul> |
| `_eventname` | `Error` | Requst of issue insignia is failed. | <ul><li>Emit `CodeIssuePendingNotFound` if the insignia pending object is not registered</li><li>Emit `CodeIssueNotVoted` if the insignia pending object is not voted by other onwer of insignia.</li><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered</li></ul> |

#### 5. CreateInsigniaTemplate()

```
(* @dev: Create a new insignia template. Only owner can create. *)
transition CreateInsigniaTemplate(template_id: Uint32, template_name: String, template_url: String)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id will be created. |
| `template_name` | `String` | Name of the insigina template. |
| `template_url` | `String` | Metadata url of the insigina template. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `CreateInsigniaTemplateSuccess` | An insignia template is created successfully. | <ul><li>`template_id` : `Uint32`<br/>An insignia template id created.</li><li>`template_name` : `String`<br/>An insignia template name created.</li></ul> |
| `_eventname` | `Error` | Creating insignia is failed. | <ul><li>Emit `CodeInsigniaTemplateExists` if the insignia template id is registered already.</li></ul> |

#### 6. RemoveInsigniaTemplate()

```
(* @dev: Remove a insignia template. Only owner can remove. *)
transition RemoveInsigniaTemplate(template_id: Uint32)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id trying to delete. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `RemoveInsigniaTemplateSuccess` | An insignia template is deleted successfully. | <ul><li>`template_id` : `Uint32`<br/>An insignia template id deleted.</li></ul> |
| `_eventname` | `Error` | Delete insignia is failed. | <ul><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered.</li></ul> |

#### 7. SetTreasuryAccess()

```
(* @dev: Set accessibility of specific insignia template for treasury wallet. *)
transition SetTreasuryAccess(template_id: Uint32, access: Bool)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id trying to configure. |
| `access` | `Bool` | Accessibility to treasury wallet. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `SetTreasuryAccessSuccess` | Accessibility is changed successfully. | <ul><li>`template_id` : `Uint32`<br/>An insignia template id configured.</li><li>`access` : `Bool`<br/>Accessibility to treasury wallet.</li></ul> |
| `_eventname` | `Error` | Change accessibility is failed. | <ul><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered.</li></ul> |

#### 8. SetProposalAccess()

```
(* @dev: Set accessibility of specific insignia template for creating proposal. *)
transition SetProposalAccess(template_id: Uint32, access: Bool)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id trying to configure. |
| `access` | `Bool` | Accessibility to create proposal. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `SetProposalAccessSuccess` | Accessibility is changed successfully. | <ul><li>`template_id` : `Uint32`<br/>An insignia template id configured.</li><li>`access` : `Bool`<br/>Accessibility to create proposal.</li></ul> |
| `_eventname` | `Error` | Change accessibility is failed. | <ul><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered.</li></ul> |

#### 9. SetVoteAccess()

```
(* @dev: Set accessibility of specific insignia template for voting. *)
transition SetVoteAccess(template_id: Uint32, access: Bool)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id trying to configure. |
| `access` | `Bool` | Accessibility to vote proposal. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `SetProposalAccessSuccess` | Accessibility is changed successfully. | <ul><li>`template_id` : `Uint32`<br/>An insignia template id configured.</li><li>`access` : `Bool`<br/>Accessibility to create vote.</li></ul> |
| `_eventname` | `Error` | Change accessibility is failed. | <ul><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered.</li></ul> |

#### 10. SetIssueAccess()

```
(* @dev: Set accessibility of specific insignia template for voting issue insignia. *)
transition SetIssueAccess(template_id: Uint32, access: Bool)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id trying to configure. |
| `access` | `Bool` | Accessibility to issue insignia. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `SetIssueAccessSuccess` | Accessibility is changed successfully. | <ul><li>`template_id` : `Uint32`<br/>An insignia template id configured.</li><li>`access` : `Bool`<br/>Accessibility to issue insignia.</li></ul> |
| `_eventname` | `Error` | Change accessibility is failed. | <ul><li>Emit `CodeInsigniaTemplateNotFound` if the insignia template id is not registered.</li></ul> |

#### 11. SetTreasuryAddress()

```
(* @dev: Set treasury ZRC4 wallet address *)
transition SetTreasuryAddress(wallet_address: ByStr20)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `wallet_address` | `ByStr20` | Treasury wallet address for insignia. |

#### 12. SubmitTransactionToTreasuryWallet()

```
(* Submit a transaction for future signoff *)
transition SubmitTransactionToTreasuryWallet(template_id: Uint32, insignia_id: Uint128, recipient : ByStr20, amount : Uint128, tag : String)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id being used by sender. |
| `insignia_id` | `Uint128` | Insignia id being used by sender. |
| `recipient` | `ByStr20` | Address of the recipient to transfer amount to. |
| `amount` | `Uint128` | Amount of funds to be transferred. |
| `tag` | `String` | Transition name to be invoked. Designed in the scenario of invoking a transition of another contract. Otherwise, the `tag` should be set to `AddFunds`. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `SubmitTransaction` | Transaction is submitted successfully. | <ul><li>`recipient` : `ByStr20`<br/>Address of recipient</li><li>`amount` : `Uint128`<br/>Amount of funds to be transferred</li><li>`tag` : `String`<br/>Transition name to be invoked</li></ul> |
| `_eventname` | `Error` | Transaction is not submitted. | <ul><li>Emit `CodeInvalidTreasuryWallet` if the treasury wallet address is not registered.</li></ul> |

#### 13. SendMessageToTreasuryWallet()

```
(* Submit a transaction for future signoff *)
transition SendMessageToTreasuryWallet(template_id: Uint32, insignia_id: Uint128, action_name: String, transaction_id: Uint32): Uint128, tag : String)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id being used by sender. |
| `insignia_id` | `Uint128` | Insignia id being used by sender. |
| `action_name` | `String` | Transition name of ZRC4 `SignTransaction`, `ExecuteTransaction`, `RevokeSignature`. |
| `transaction_id` | `Uint32` | Transaction id of treasury wallet. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `Error` | Transaction is not submitted. | <ul><li>Emit `CodeInvalidTreasuryWallet` if the treasury wallet address is not registered.</li></ul> |

#### 14. AddFundsToTreasuryWallet()

```
(* Add fund to treasury wallet *)
transition AddFundsToTreasuryWallet(template_id: Uint32, insignia_id: Uint128)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `template_id` | `Uint32` | Insignia template id being used by sender. |
| `insignia_id` | `Uint128` | Insignia id being used by sender. |

#### 15. TransferOwnership()

```
(* @dev: Transfers contract ownership to a new address. 
  The new address must call the AcceptOwnership transition to finalize the transfer. *)
(* @param new_owner: Address of the new contract_owner.                              *)
transition TransferOwnership(new_owner: ByStr20)
```

**Arguments:**
| Name | Type | Description |
| ----------- | --------- | ----------- |
| `new_owner` | `ByStr20` | New address of smart contract owner. |

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `OwnershipTransferInitiated` | Pending owner is registered successfully. | <ul><li>`contract_owner` : `ByStr20`<br/>Address of current owner.</li><li>`pending_owner` : `ByStr20`<br/>Address of new owner.</li></ul> |

#### 16. AcceptOwnership()

```
(* @dev: Finalizes transfer of contract ownership. Must be called by the new contract_owner. *)
transition AcceptOwnership()
```

**Events:**
| | Name | Description | Event Parameters |
| ------------ | ---------------------- | -------------------------------------- | ---------------- |
| `_eventname` | `OwnershipTransferAccepted` | Ownership transfered successfully. | <ul><li>`previous_contract_owner` : `ByStr20`<br/>Address of old owner.</li><li>`contract_owner` : `ByStr20`<br/>Address of current owner.</li></ul> |

**Deployed address (Testnet):**
| Name | Bech32 | Base16 |
| ----------- | --------- | --------- |
| Treasury | [zil1eaz5ngkazcjs50x5gs40ka20kgtqgfz7l4u9y5](https://viewblock.io/zilliqa/address/zil1eaz5ngkazcjs50x5gs40ka20kgtqgfz7l4u9y5?network=testnet) | 0xcf4549a2dd16250a3cd4442afb754fb21604245e |
| Insignia | [zil1aduh9gr4cmlkwtrz8ks86vgxwcfvafmk6c8k6y](https://viewblock.io/zilliqa/address/zil1aduh9gr4cmlkwtrz8ks86vgxwcfvafmk6c8k6y?network=testnet) | 0xeb7972a075c6ff672c623da07d31067612cea776 |

