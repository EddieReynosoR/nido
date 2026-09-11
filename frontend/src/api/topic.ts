import { type Topic } from "@/types/topic.types";
import { executeFetch, BASE_URL } from "./auth";

export function getTopics(spaceId:string, accessToken: string) {
    return executeFetch<Topic[]>(
        `${BASE_URL}/api/topic?spaceId=${spaceId}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        },
        'There was an error fetching the topics of the respective space.'
    )
}