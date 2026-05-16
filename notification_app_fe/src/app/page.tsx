"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Chip, Pagination, Box, CircularProgress, Stack } from '@mui/material';
import { fetchNotifications, markAsViewed } from '@/utils/api';

interface Notification {
    ID: string;
    Type: "Placement" | "Result" | "Event";
    Message: string;
    Timestamp: string;
}

export default function Home() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [viewedSet, setViewedSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchNotifications(page, 10);
            if (data && data.notifications) {
                setNotifications(data.notifications);
            }
            setLoading(false);
        };
        loadData();
    }, [page]);

    const handleView = (id: string) => {
        if (!viewedSet.has(id)) {
            const newSet = new Set(viewedSet).add(id);
            setViewedSet(newSet);
            markAsViewed(id);
        }
    };

    const getColor = (type: string) => {
        if (type === 'Placement') return 'success';
        if (type === 'Result') return 'warning';
        return 'info';
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Recent Notifications
            </Typography>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={2}>
                    {notifications.map((notif) => {
                        const isUnread = !viewedSet.has(notif.ID);
                        return (
                            <Card 
                                key={notif.ID}
                                onMouseEnter={() => handleView(notif.ID)}
                                sx={{ 
                                    borderLeft: isUnread ? '6px solid #1976d2' : 'none',
                                    backgroundColor: isUnread ? '#ffffff' : '#f9f9f9',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" fontWeight={isUnread ? 'bold' : 'normal'}>
                                            {notif.Message}
                                        </Typography>
                                        <Chip label={notif.Type} color={getColor(notif.Type)} size="small" />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(notif.Timestamp).toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                    count={5} 
                    page={page} 
                    onChange={(_, value) => setPage(value)} 
                    color="primary" 
                />
            </Box>
        </Box>
    );
}