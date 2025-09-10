use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction, Input, Output}
use cardano/assets.{from_lovelace}
use mocktail.{mocktail_tx, tx_in, mock_script_address, mock_tx_hash, complete, add_extra_signatory}
use cocktail.{key_signed}


// The KnowIt Dapp is a platform where players (5-20) participate in...
// ...a quiz and the top three emerging winners recieve rewards in Ada.

// The smart contracts of the KnowIt Dapp enables locking of assets and...
// ...automated payment of the locked tokens to the game winners.

// There are three different script handling the management of assets:
//   PayFirstWinner -> Locking/Payment of assets for the first winner
//   PaySecondWinner -> Locking/Payment of assets for the second winner
//   PayThirdWinner -> Locking/Payment of assets for the third winner

// The Datum is the public key hash of the wallet address signing the...
// ...transaction to unlock the reward to be paid to the winner
pub type Datum {
    payment_authorizer: VerificationKeyHash,
}

// The Redeemer determines the script from which we will be unlocking the...
// ...utxo and the value of that utxo (in lovelace) must be specified.
pub type Redeemer {
    PayFirstWinner { amount: Int }
    PaySecondWinner { amount: Int }
    PayThirdWinner { amount: Int }
}

validator pay_first_winner {
    spend(
        datum: Option<Datum>,
        redeemer: Redeemer,
        _own_ref: OutputReference,
        tx: Transaction
    ) {
        when redeemer is {
            PayFirstWinner { amount } -> {
                // Get the inputs from the transaction
                let Transaction { inputs, .. } = tx
                
                // The transaction should only have one input
                when inputs is {
                    [_] -> {
                        // Get the script input to be spent
                        expect Some(self_input) = list.head(inputs)

                        // Validate the amount of lovelace in the input
                        let value_is_valid: Bool = self_input.output.value == from_lovelace(amount)
                        
                        // Ensure the transaction is signed by the authorizer
                        expect Some(Datum { payment_authorizer }) = datum
                        // let is_signed_by_authorizer = list.has(tx.extra_signatories, payment_authorizer)
                        let is_signed_by_authorizer = key_signed(tx.extra_signatories, payment_authorizer)

                        is_signed_by_authorizer && value_is_valid
                    }
                    _ -> False
                } 
            }
            _ -> False
        }       
    }

    else(_) {
    fail
  }
}


// validator pay_second_winner {}

// validator pay_third_winner {}



// ##############     TESTING THE VALIDATOR       ##################
// For the spending transaction to succeed, the following conditions must be met:
// 1. The validation must be initiated by the correct script (PayFirstWinner).
// 2. The transaction must have exactly one input.
// 3. The input must have a value equal to the amount specified in the redeemer.
// 4. The transaction must be signed by the payment authorizer specified in the datum.


test pay_first_winner_passes() {
    let redeemer = PayFirstWinner { amount: 10000000 }
    let datum = 
        Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000000"}
    let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

    let tx = mocktail_tx()
        |> tx_in(
            True,
            mock_tx_hash(0),
            0,
            from_lovelace(10_000_000),
            mock_script_address(0, None),
        )
        |> complete()
        |> add_extra_signatory(True, datum.payment_authorizer)

    pay_first_winner.spend(
        Some(datum),
        redeemer,
        placeholder_utxo,
        tx
    )
}


test pay_first_winner_fails_with_invalid_redeemer() {
    let redeemer = PaySecondWinner { amount: 10000000 }
    let datum = 
        Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000000"}
    let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

    let tx = mocktail_tx()
        |> tx_in(
            True,
            mock_tx_hash(0),
            0,
            from_lovelace(10_000_000),
            mock_script_address(0, None),
        )
        |> complete()
        |> add_extra_signatory(True, datum.payment_authorizer)

    !pay_first_winner.spend(
        Some(datum),
        redeemer,
        placeholder_utxo,
        tx
    )
}


test pay_first_fails_with_no_tx_input() {
    let redeemer = PayFirstWinner { amount: 10000000 }
    let datum = 
        Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000000"}
    let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

    let tx = mocktail_tx()
        |> tx_in(
            False,
            mock_tx_hash(0),
            0,
            from_lovelace(10_000_000),
            mock_script_address(0, None),
        )
        |> complete()
        |> add_extra_signatory(True, datum.payment_authorizer)

    !pay_first_winner.spend(
        Some(datum),
        redeemer,
        placeholder_utxo,
        tx
    )
}


test pay_first_winner_fails_with_multiple_input() {
    let redeemer = PayFirstWinner { amount: 10000000 }
    let datum = 
        Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000000"}
    let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

    let tx = mocktail_tx()
        |> tx_in(
            True,
            mock_tx_hash(0),
            0,
            from_lovelace(10_000_000),
            mock_script_address(0, None),
        )
        |> tx_in(
            True,
            mock_tx_hash(1),
            1,
            from_lovelace(10_000_000),
            mock_script_address(0, None),
        )
        |> complete()
        |> add_extra_signatory(True, datum.payment_authorizer)

    !pay_first_winner.spend(
        Some(datum),
        redeemer,
        placeholder_utxo,
        tx
    )
}


test pay_first_winner_fails_with_invalid_ada_amount() {
    let redeemer = PayFirstWinner { amount: 10000000 }
    let datum = 
        Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000000"}
    let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

    let tx = mocktail_tx()
        |> tx_in(
            True,
            mock_tx_hash(0),
            0,
            from_lovelace(1_000_000),
            mock_script_address(0, None),
        )
        |> complete()
        |> add_extra_signatory(True, datum.payment_authorizer)

    !pay_first_winner.spend(
        Some(datum),
        redeemer,
        placeholder_utxo,
        tx
    )
}


test pay_first_winner_fails_with_invalid_tx_signer() {
    let redeemer = PayFirstWinner { amount: 10000000 }
    let datum = Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000000"}
    let other_datum = Datum { payment_authorizer: #"00000000000000000000000000000000000000000000000000000001"}
    let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

    let tx = mocktail_tx()
        |> tx_in(
            True,
            mock_tx_hash(0),
            0,
            from_lovelace(10_000_000),
            mock_script_address(0, None),
        )
        |> complete()
        |> add_extra_signatory(True, datum.payment_authorizer)

    !pay_first_winner.spend(
        Some(other_datum),
        redeemer,
        placeholder_utxo,
        tx
    )
}