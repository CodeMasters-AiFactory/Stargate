import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Database,
  Plus,
  Table,
  Play,
  Download,
  Upload,
  Settings,
  RefreshCw,
  BarChart3,
} from 'lucide-react';

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastModified: Date;
}

export function DatabasePanel() {
  const [isConnected] = useState(true);
  const [tables] = useState<DatabaseTable[]>([
    { name: 'users', rows: 1247, size: '2.3 MB', lastModified: new Date('2024-01-10') },
    { name: 'projects', rows: 89, size: '456 KB', lastModified: new Date('2024-01-09') },
    { name: 'sessions', rows: 3421, size: '1.1 MB', lastModified: new Date('2024-01-10') },
    { name: 'analytics', rows: 15680, size: '8.7 MB', lastModified: new Date('2024-01-10') },
  ]);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);

  const executeQuery = async () => {
    // Simulate query execution
    setQueryResult({
      rows: [
        { id: 1, username: 'john_doe', email: 'john@example.com', created_at: '2024-01-01' },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', created_at: '2024-01-02' },
        { id: 3, username: 'dev_user', email: 'dev@stargate.com', created_at: '2024-01-03' },
      ],
      executionTime: '23ms',
      rowsAffected: 3,
    });
  };

  return (
    <div className="h-full flex flex-col" data-testid="database-panel">
      {/* Header */}
      <div className="p-4 border-b border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Advanced Database
            </h2>
            <p className="text-sm text-muted-foreground">Unlimited storage & advanced analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-500">∞</div>
              <div className="text-xs text-muted-foreground">Storage</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-500">{tables.length}</div>
              <div className="text-xs text-muted-foreground">Tables</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-purple-500">
                {tables.reduce((sum, table) => sum + table.rows, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Rows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-orange-500">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tables */}
        <div className="w-80 border-r border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tables</h3>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              New Table
            </Button>
          </div>

          <div className="space-y-2">
            {tables.map(table => (
              <div
                key={table.name}
                className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                data-testid={`table-${table.name}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{table.name}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    {table.rows.toLocaleString()} rows • {table.size}
                  </div>
                  <div>Modified {table.lastModified.toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Database
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Right Panel - Query Interface */}
        <div className="flex-1 flex flex-col">
          {/* Query Editor */}
          <div className="p-4 border-b border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">SQL Query</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Format
                </Button>
                <Button size="sm" onClick={executeQuery} data-testid="button-execute-query">
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </Button>
              </div>
            </div>
            <Textarea
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="font-mono text-sm min-h-[120px]"
              placeholder="Enter your SQL query..."
              data-testid="sql-query-input"
            />
          </div>

          {/* Query Results */}
          <div className="flex-1 p-4">
            {queryResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Query Results</h3>
                  <div className="text-sm text-muted-foreground">
                    {queryResult.rowsAffected} rows • {queryResult.executionTime}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {queryResult.rows.length > 0 &&
                          Object.keys(queryResult.rows[0]).map(column => (
                            <th key={column} className="text-left p-3 font-medium">
                              {column}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row: any, index: number) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="p-3 text-sm">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="w-12 h-12 mx-auto mb-4" />
                  <p>Execute a query to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Competitive Advantage */}
      <div className="p-4 border-t border">
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <div>
                <h4 className="font-medium text-indigo-700 dark:text-indigo-300 text-sm">
                  🗄️ Stargate Database Advantage
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Unlimited storage, advanced analytics, real-time monitoring, and enterprise-grade
                  security - beyond basic database access!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
