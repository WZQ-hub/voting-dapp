import { beforeAll, describe, expect, it } from 'vitest';
import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchCounter,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
import { BN, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { Voting } from '../target/types/voting'
import { loadKeypairSignerFromFile } from 'gill/node'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49.js';
import { aN } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';
const IDL = require('../target/idl/voting.json')
const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })
const votingAdress = new PublicKey("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");


describe('voting', () => {

  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll(
    async () => {
    context = await startAnchor("", [{name: "voting", programId: votingAdress}], []);
	  provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(
		IDL,
		provider,
	);
    }
  )

  it('Initialize poll', async () => {

    await votingProgram.methods.initializePoll(
      new BN(1), // poll_id
      new BN(0), // poll_start
      new BN(1821246488), // poll_end
      "Best programming language", // description
    ).rpc();

    const [pollAdress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8)],
      votingAdress
    );

    const poll = await votingProgram.account.poll.fetch(pollAdress);

    console.log("poll is ", poll);
    
    expect(poll.description).toEqual("Best programming language");
    expect(poll.pollStart.toNumber()).toBeLessThan(1821246488);
    

  });

  it("Initialize candidate", async() => {
    await votingProgram.methods.initializeCandidate(
      "Super", // candidate_name
      new BN(1),  // poll_id
    ).rpc();

    const [candidateAdress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Super")],
      votingAdress,     
    )
    const candidate = await votingProgram.account.candidate.fetch(candidateAdress);
    
    console.log("candidate is ", candidate);
})

  it("vote", async() => {
    await votingProgram.methods.vote(
      new BN(1),  // poll_id
      "Super", // candidate_name
    ).rpc();

    const [candidateAdress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Super")],
      votingAdress,     
    )
    const candidate = await votingProgram.account.candidate.fetch(candidateAdress);
    
    console.log("vote is ", candidate);

    const [pollAdress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8)],
      votingAdress
    );

    const poll = await votingProgram.account.poll.fetch(pollAdress);

    console.log("poll is ", poll);
  })

})

