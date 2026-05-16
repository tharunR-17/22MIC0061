"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Stack, MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import { fetchNotifications } from '@/utils/api';

interface Notification {
    ID: string;
    Type: "Placement" | "Result" | "Event";
    Message: string;
    Timestamp: string;
}

const typeWeights: Record<string, number> = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

// Custom sorting logic combining weight and recency
const sortPriority = (a: Notification, b: Notification) => {
    if (typeWeights[a.Type] !== typeWeights[b.Type]) {
        return typeWeights[b.Type] - typeWeights[a.Type];
    }
    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
};

export default function PriorityInbox() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(10); // "n" selection
    const [filterType, setFilterType] = useState<string>('All');

    useEffect(() => {
        const loadPriorityData = async () => {
            setLoading(true);
            // Fetch a larger pool from the server to sort locally for the top 'n'
            const data = await fetchNotifications(1, 50, filterType === 'All' ? undefined : filterType);
            if (data && data.notifications) {
                const sorted = [...data.notifications].sort(sortPriority);
                setNotifications(sorted.slice(0, limit));
            }
            setLoading(false);
        };
        loadPriorityData();
    }, [limit, filterType]);

    const getColor = (type: string) => {
        if (type === 'Placement') return 'success';
        if (type === 'Result') return 'warning';
        return 'info';
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Priority Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Displaying the top important updates based on category weight and recency.
            </Typography>

            {/* Controls for Selection and Filtering */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="limit-label">Show Top (n)</InputLabel>
                    <Select
                        labelId="limit-label"
                        value={limit}
                        label="Show Top (n)"
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        <MenuItem value={10}>10 Notifications</MenuItem>
                        <MenuItem value={15}>15 Notifications</MenuItem>
                        <MenuItem value={20}>20 Notifications</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel id="filter-label">Notification Type</InputLabel>
                    <Select
                        labelId="filter-label"
                        value={filterType}
                        label="Notification Type"
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <MenuItem value="All">All Types</MenuItem>
                        <MenuItem value="Placement">Placements Only</MenuItem>
                        <MenuItem value="Result">Results Only</MenuItem>
                        <MenuItem value="Event">Events Only</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* Notifications Feed */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : notifications.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No high-priority notifications found matching the criteria.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {notifications.map((notif) => (
                        <Card 
                            key={notif.ID}
                            sx={{ 
                                borderLeft: '6px solid #e65100', // Distinct color for priority inbox
                                backgroundColor: '#ffffff',
                                transition: '0.3s'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {notif.Message}
                                    </Typography>
                                    <Chip label={notif.Type} color={getColor(notif.Type)} size="small" />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notif.Timestamp).toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}