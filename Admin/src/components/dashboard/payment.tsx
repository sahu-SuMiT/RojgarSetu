import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/transactions`);
        let txns = [];
        if (Array.isArray(res.data)) {
          txns = res.data;
        } else if (Array.isArray(res.data.data)) {
          txns = res.data.data;
        }
        setTransactions(txns);
      } catch (err) {
        setTransactions([]);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn =>
    (txn.payomatixId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (txn.customerEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ).filter(txn =>
    statusFilter === "all" || txn.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Transaction ID or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Txn ID</TableHead>
                  <TableHead>Correlation ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Customer Email</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Customer Phone</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Failure Reason</TableHead>
                  <TableHead>Received At</TableHead>
                  <TableHead>Processed At</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Retry Count</TableHead>
                  <TableHead>Last Retry At</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center text-gray-400">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map(txn => (
                    <TableRow key={txn._id}>
                      <TableCell>{txn.payomatixId}</TableCell>
                      <TableCell>{txn.correlationId}</TableCell>
                      <TableCell>{txn.status}</TableCell>
                      <TableCell>{txn.amount}</TableCell>
                      <TableCell>{txn.currency}</TableCell>
                      <TableCell>{txn.customerEmail}</TableCell>
                      <TableCell>{txn.customerName}</TableCell>
                      <TableCell>{txn.customerPhone}</TableCell>
                      <TableCell>{txn.message}</TableCell>
                      <TableCell>{txn.failureReason}</TableCell>
                      <TableCell>{txn.receivedAt ? new Date(txn.receivedAt).toLocaleString() : ""}</TableCell>
                      <TableCell>{txn.processedAt ? new Date(txn.processedAt).toLocaleString() : ""}</TableCell>
                      <TableCell>{txn.paymentMethod}</TableCell>
                      <TableCell>{txn.retryCount}</TableCell>
                      <TableCell>{txn.lastRetryAt ? new Date(txn.lastRetryAt).toLocaleString() : ""}</TableCell>
                      <TableCell>{txn.createdAt ? new Date(txn.createdAt).toLocaleString() : ""}</TableCell>
                      <TableCell>{txn.updatedAt ? new Date(txn.updatedAt).toLocaleString() : ""}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}