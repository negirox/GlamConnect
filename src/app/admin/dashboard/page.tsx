
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, UserCheck, Shield } from "lucide-react";

const userDistributionData = [
  { name: 'Models', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Brands', value: 150, fill: 'hsl(var(--chart-2))' },
  { name: 'Admins', value: 5, fill: 'hsl(var(--chart-3))' },
];

const contentStatusData = [
  { name: 'Verified Gigs', count: 120 },
  { name: 'Pending Gigs', count: 15 },
  { name: 'Verified Models', count: 350 },
  { name: 'Pending Models', count: 50 },
];

const chartConfig = {
  models: { label: "Models", color: "hsl(var(--chart-1))" },
  brands: { label: "Brands", color: "hsl(var(--chart-2))" },
  admins: { label: "Admins", color: "hsl(var(--chart-3))" },
  verifiedGigs: { label: "Verified Gigs", color: "hsl(var(--primary))" },
  pendingGigs: { label: "Pending Gigs", color: "hsl(var(--secondary))" },
  verifiedModels: { label: "Verified Models", color: "hsl(var(--accent))" },
  pendingModels: { label: "Pending Models", color: "hsl(var(--destructive))" },
}

export default function AdminDashboardPage() {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-headline font-bold mb-6">Admin Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">555</div>
                        <p className="text-xs text-muted-foreground">400 Models, 150 Brands</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Gigs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">120</div>
                         <p className="text-xs text-muted-foreground">+18 from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">65</div>
                        <p className="text-xs text-muted-foreground text-orange-500">50 models, 15 gigs</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports Pending</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground text-red-500">Action required</p>
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
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={userDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Content Status</CardTitle>
                        <CardDescription>Current state of gigs and model profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
