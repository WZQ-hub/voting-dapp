import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { BN, Program } from '@coral-xyz/anchor';
import { Voting } from '../../../../anchor/target/types/voting';
import { connection } from 'next/server';


const IDL = require('../../../../anchor/target/idl/voting.json');
export const OPTIONS = GET; // 允许预检请求

export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP1zNmfysetgzvGvWKp2P-E9CKvlDGzuWzRQ&s",
        title: "Vote",
        description: "这是一个投票blink",
        label: "VVVVVOTE!!!",
        links: {
            actions: [
                {
                    type: "transaction",
                    label: "Vote for Crunchy",
                    href: "/api/vote?candidate=Crunchy",
                },
                {
                    type: "transaction",
                    label: "Vote for Smooth",
                    href: "/api/vote?candidate=Smooth",
                }
            ]
        }
    }; 
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS}); // ACTIONS_CORS_HEADERS 允许跨域资源共享
} 

export async function POST(request: Request) {
    
    const url = new URL(request.url);
    const candidate = url.searchParams.get("candidate");

    if (candidate != "Crunchy" && candidate != "Smooth") {
        return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS});
    }
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const program: Program<Voting> = new Program(IDL, {connection}) 
    const body: ActionPostRequest = await request.json();
    let voter;

    try {
        voter = new PublicKey(body.account);
    } catch (error) {
        return new Response("Invalid voter account", { status: 400, headers: ACTIONS_CORS_HEADERS});
    }
    // instruction()生成一个 指令对象 (TransactionInstruction)，但是先别发出去
    const instruction = await program.methods
                                            .vote(new BN(1), candidate)
                                            .accounts({
                                                signer: voter,
                                            })
                                            .instruction();
    const blockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction(
        {
            feePayer: voter,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }
    ).add(instruction);

    const response = await createPostResponse(
        {
            fields: {
                type: "transaction",
                transaction: transaction,
            }
        }
    );

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS});
}