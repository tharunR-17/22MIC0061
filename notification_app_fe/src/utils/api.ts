import { initLogger, Log } from 'logging_middleware';

const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGFydW4ucjIwMjJhQHZpdHN0dWRlbnQuYWMuaW4iLCJleHAiOjE3Nzg5MzQ0MDcsImlhdCI6MTc3ODkzMzUwNywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjRiMWM3ZTBlLWYwYWMtNGZjMi1hMmFkLTNkNTYzOWQ4ZmJiNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InRoYXJ1biByIiwic3ViIjoiZTMyMjI4NDktMzA2YS00NGE3LWIwYTUtZWRiODMwNTgyYWMzIn0sImVtYWlsIjoidGhhcnVuLnIyMDIyYUB2aXRzdHVkZW50LmFjLmluIiwibmFtZSI6InRoYXJ1biByIiwicm9sbE5vIjoiMjJtaWMwMDYxIiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiZTMyMjI4NDktMzA2YS00NGE3LWIwYTUtZWRiODMwNTgyYWMzIiwiY2xpZW50U2VjcmV0IjoiUFFhRENCRHl3ZnZRc01EaiJ9.WkgXQGYZpGoUN1G-_Muzf_jNROhIntq0GcIdfWwoWiM"; 
const BASE_URL = "/api/eval";

initLogger(API_TOKEN);

export const fetchNotifications = async (page: number = 1, limit: number = 10, type?: string) => {
    // Point directly to our secure internal Next.js API route
    let url = `/api/notifications?page=${page}&limit=${limit}`;
    if (type) url += `&notification_type=${type}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Proxy handler failed');
        return await response.json();
    } catch (error) {
        console.error("Client side fetch failed:", error);
        return null;
    }
};

export const markAsViewed = async (id: string) => {
    console.log(`Notification ${id} marked as viewed.`);
};
