import { NextResponse } from 'next/server';
import { initLogger, Log } from 'logging_middleware';

const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGFydW4ucjIwMjJhQHZpdHN0dWRlbnQuYWMuaW4iLCJleHAiOjE3Nzg5MzQ0MDcsImlhdCI6MTc3ODkzMzUwNywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjRiMWM3ZTBlLWYwYWMtNGZjMi1hMmFkLTNkNTYzOWQ4ZmJiNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InRoYXJ1biByIiwic3ViIjoiZTMyMjI4NDktMzA2YS00NGE3LWIwYTUtZWRiODMwNTgyYWMzIn0sImVtYWlsIjoidGhhcnVuLnIyMDIyYUB2aXRzdHVkZW50LmFjLmluIiwibmFtZSI6InRoYXJ1biByIiwicm9sbE5vIjoiMjJtaWMwMDYxIiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiZTMyMjI4NDktMzA2YS00NGE3LWIwYTUtZWRiODMwNTgyYWMzIiwiY2xpZW50U2VjcmV0IjoiUFFhRENCRHl3ZnZRc01EaiJ9.WkgXQGYZpGoUN1G-_Muzf_jNROhIntq0GcIdfWwoWiM";
const TARGET_URL = "http://4.224.186.213/evaluation-service/notifications";

// Initialize the logger on the server-side
initLogger(API_TOKEN);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const type = searchParams.get('notification_type');

    let remoteUrl = `${TARGET_URL}?page=${page}&limit=${limit}`;
    if (type) remoteUrl += `&notification_type=${type}`;

    try {
        // Track the request execution using your custom logging middleware
        await Log('backend', 'info', 'route', `Backend proxy fetching page ${page} from evaluation server`);

        const response = await fetch(remoteUrl, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            await Log('backend', 'error', 'route', `Remote server returned status ${response.status}`);
            return NextResponse.json({ error: 'Failed to fetch from evaluation server' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        await Log('backend', 'fatal', 'db', 'Critical network failure inside backend proxy gateway');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}