import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import academicApi from '@/services/academicApi';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  response?: any;
}

const BackendTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    {
      name: 'Universities List',
      test: () => academicApi.getUniversities()
    },
    {
      name: 'Auth Login (Test)',
      test: () => academicApi.login('test@example.com', 'test123')
    },
    {
      name: 'Student Profile (Auth Required)',
      test: () => academicApi.getStudentProfile()
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const test of testEndpoints) {
      setResults(prev => [...prev, {
        endpoint: test.name,
        status: 'pending',
        message: 'Testing...'
      }]);

      try {
        const response = await test.test();

        setResults(prev => prev.map(r => 
          r.endpoint === test.name 
            ? {
                ...r,
                status: 'success',
                message: `Success - Data received`,
                response: response
              }
            : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.endpoint === test.name 
            ? {
                ...r,
                status: 'error',
                message: error.response?.status 
                  ? `Error ${error.response.status}: ${error.response.data?.error || error.message}`
                  : `Network Error: ${error.message}`
              }
            : r
        ));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Backend Connection Test
          <Badge variant="outline">localhost:8000</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setResults([])}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.endpoint}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> This component tests the connection to your Django backend at localhost:8000. 
          Make sure your Django server is running before testing.
        </div>
      </CardContent>
    </Card>
  );
};

export default BackendTest;
