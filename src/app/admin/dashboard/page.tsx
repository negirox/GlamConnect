
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Briefcase, UserCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers } from "@/lib/user-actions";
import { getGigs } from "@/lib/gig-actions";
import { getModels } from "@/lib/data-actions";

const chartConfig = {
  models: { label: "Models", color: "hsl(var(--chart-1))" },
  brands: { label: "Brands", color: "hsl(var(--chart-2))" },
  admins: { label: "Admins", color: "hsl(var(--chart-3))" },
  verifiedGigs: { label: "Verified Gigs", color: "hsl(var(--primary))" },
  pendingGigs: { label: "Pending Gigs", color: "hsl(var(--secondary))" },
  verifiedModels: { label: "Verified Models", color: "hsl(var(--accent))" },
  pendingModels: { label: "Pending Models", color: "hsl(var(--destructive))" },
}

type DashboardData = {
    totalUsers: number;
    modelCount: number;
    brandCount: number;
    adminCount: number;
    openGigs: number;
    pendingModels: number;
    pendingGigs: number;
    verifiedModels: number;
    verifiedGigs: number;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [users, gigs, models] = await Promise.all([
                getAllUsers(),
                getGigs(),
                getModels()
            ]);

            const modelCount = users.filter(u => u.role === 'model').length;
            const brandCount = users.filter(u => u.role === 'brand').length;
            const adminCount = users.filter(u => u.role === 'admin').length;
            
            const verifiedGigs = gigs.filter(g => g.status === 'Verified').length;
            const pendingGigs = gigs.filter(g => g.status === 'Pending').length;
            
            const verifiedModels = models.filter(m => m.verificationStatus === 'Verified').length;
            const pendingModels = models.filter(m => m.verificationStatus === 'Pending').length;

            setData({
                totalUsers: users.length,
                modelCount,
                brandCount,
                adminCount,
                openGigs: verifiedGigs,
                pendingModels,
                pendingGigs,
                verifiedModels,
                verifiedGigs,
            });
            setLoading(false);
        }

        fetchData();
    }, []);

    const userDistributionData = data ? [
        { name: 'Models', value: data.modelCount, fill: 'hsl(var(--chart-1))' },
        { name: 'Brands', value: data.brandCount, fill: 'hsl(var(--chart-2))' },
        { name: 'Admins', value: data.adminCount, fill: 'hsl(var(--chart-3))' },
    ] : [];

    const contentStatusData = data ? [
        { name: 'Verified Gigs', count: data.verifiedGigs },
        { name: 'Pending Gigs', count: data.pendingGigs },
        { name: 'Verified Models', count: data.verifiedModels },
        { name: 'Pending Models', count: data.pendingModels },
    ] : [];

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
    }

    if (!data) {
        return <div className="p-8 text-center">Failed to load dashboard data.</div>
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-headline font-bold mb-6">Admin Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">{data.modelCount} Models, {data.brandCount} Brands</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified Gigs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.openGigs}</div>
                         <p className="text-xs text-muted-foreground">Live on the platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.pendingModels + data.pendingGigs}</div>
                        <p className="text-xs text-muted-foreground text-orange-500">{data.pendingModels} models, {data.pendingGigs} gigs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                        <CardDescription>A breakdown of user roles on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={userDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ResponsiveContainer>
                       </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Content Status</CardTitle>
                        <CardDescription>Current state of gigs and model profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" height={50} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
