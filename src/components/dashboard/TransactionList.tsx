"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

const transactions = [
  {
    id: 1,
    type: "sent",
    amount: "500.00",
    currency: "USDC",
    status: "completed",
    date: "Today, 10:23 AM",
    recipient: "alice@example.com",
  },
  {
    id: 2,
    type: "received",
    amount: "1,200.00",
    currency: "USDC",
    status: "completed",
    date: "Yesterday, 4:15 PM",
    sender: "bob@example.com",
  },
  {
    id: 3,
    type: "sent",
    amount: "50.00",
    currency: "USDC",
    status: "pending",
    date: "Yesterday, 2:30 PM",
    recipient: "charlie@example.com",
  },
];

export function TransactionList() {
  return (
    <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-card/50">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  tx.type === "sent" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                }`}>
                  {tx.type === "sent" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {tx.type === "sent" ? `Sent to ${tx.recipient}` : `Received from ${tx.sender}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium text-sm ${tx.type === "sent" ? "text-foreground" : "text-green-600"}`}>
                  {tx.type === "sent" ? "-" : "+"}${tx.amount}
                </p>
                <div className="flex items-center justify-end gap-1">
                    {tx.status === "pending" && <Clock className="h-3 w-3 text-amber-500" />}
                    <p className={`text-xs capitalize ${
                    tx.status === "completed" ? "text-muted-foreground" : 
                    tx.status === "pending" ? "text-amber-500" : "text-destructive"
                    }`}>
                    {tx.status}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
