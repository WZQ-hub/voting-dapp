import { ActionGetResponse, ACTIONS_CORS_HEADERS } from '@solana/actions'

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
                    href: "/api/vote?candidate=crunchy",
                },
                {
                    type: "transaction",
                    label: "Vote for Smooth",
                    href: "/api/vote?candidate=smooth",
                }
            ]
        }
    }; 
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS}); // ACTIONS_CORS_HEADERS 允许跨域资源共享
} 