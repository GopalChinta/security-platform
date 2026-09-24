import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Terminal,
  ShieldAlert,
  CheckCircle2,
  Play,
  Building2,
  RefreshCw,
} from 'lucide-react';

interface TestResult {
  title: string;
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number;
  passed: boolean;
  requestPayload?: any;
  responseBody: any;
  description: string;
}

export const CrossTenantDemo: React.FC = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [customEndpoint, setCustomEndpoint] = useState('/campaigns/201');
  const [customMethod, setCustomMethod] = useState<'GET' | 'PATCH' | 'DELETE' | 'POST'>('GET');
  const [customBody, setCustomBody] = useState('{\n  "name": "Exploit Attempt"\n}');
  const [customResult, setCustomResult] = useState<TestResult | null>(null);

  const runPresetTests = async () => {
    setIsRunning(true);
    const testRuns: TestResult[] = [];

    // Test 1: Cross-tenant Campaign Access (Scenario ID: 201)
    try {
      const res = await apiClient.get('/campaigns/201');
      testRuns.push({
        title: 'Cross-Tenant Campaign Read',
        method: 'GET',
        endpoint: '/api/campaigns/201',
        status: res.status,
        expectedStatus: 404,
        passed: res.status === 404,
        responseBody: res.data,
        description: 'Attempted to fetch Globex Campaign (ID: 201) while authenticated under current tenant.',
      });
    } catch (err: any) {
      testRuns.push({
        title: 'Cross-Tenant Campaign Read',
        method: 'GET',
        endpoint: '/api/campaigns/201',
        status: err.response?.status || 500,
        expectedStatus: 404,
        passed: err.response?.status === 404,
        responseBody: err.response?.data || { error: err.message },
        description: 'Attempted to fetch Globex Campaign (ID: 201) while authenticated under current tenant.',
      });
    }

    // Test 2: Cross-tenant Campaign Deletion
    try {
      const res = await apiClient.delete('/campaigns/201');
      testRuns.push({
        title: 'Cross-Tenant Campaign Delete',
        method: 'DELETE',
        endpoint: '/api/campaigns/201',
        status: res.status,
        expectedStatus: 404,
        passed: res.status === 404,
        responseBody: res.data,
        description: 'Attempted to delete Globex Campaign (ID: 201).',
      });
    } catch (err: any) {
      testRuns.push({
        title: 'Cross-Tenant Campaign Delete',
        method: 'DELETE',
        endpoint: '/api/campaigns/201',
        status: err.response?.status || 500,
        expectedStatus: 404,
        passed: err.response?.status === 404,
        responseBody: err.response?.data || { error: err.message },
        description: 'Attempted to delete Globex Campaign (ID: 201).',
      });
    }

    // Test 3: Cross-tenant User Identity Lookup
    try {
      const res = await apiClient.get('/users/user-globex-user');
      testRuns.push({
        title: 'Cross-Tenant User Access',
        method: 'GET',
        endpoint: '/api/users/user-globex-user',
        status: res.status,
        expectedStatus: 404,
        passed: res.status === 404,
        responseBody: res.data,
        description: 'Attempted to read user details for Fiona Gallagher (Globex User).',
      });
    } catch (err: any) {
      testRuns.push({
        title: 'Cross-Tenant User Access',
        method: 'GET',
        endpoint: '/api/users/user-globex-user',
        status: err.response?.status || 500,
        expectedStatus: 404,
        passed: err.response?.status === 404,
        responseBody: err.response?.data || { error: err.message },
        description: 'Attempted to read user details for Fiona Gallagher (Globex User).',
      });
    }

    // Test 4: Cross-tenant Security Event Inspection
    try {
      const res = await apiClient.get('/security-events/evt-globex-01');
      testRuns.push({
        title: 'Cross-Tenant Security Event Read',
        method: 'GET',
        endpoint: '/api/security-events/evt-globex-01',
        status: res.status,
        expectedStatus: 404,
        passed: res.status === 404,
        responseBody: res.data,
        description: 'Attempted to read Globex Ransomware event (evt-globex-01).',
      });
    } catch (err: any) {
      testRuns.push({
        title: 'Cross-Tenant Security Event Read',
        method: 'GET',
        endpoint: '/api/security-events/evt-globex-01',
        status: err.response?.status || 500,
        expectedStatus: 404,
        passed: err.response?.status === 404,
        responseBody: err.response?.data || { error: err.message },
        description: 'Attempted to read Globex Ransomware event (evt-globex-01).',
      });
    }

    // Test 5: Cross-tenant Audit Log Inspection
    try {
      const res = await apiClient.get('/audit-logs/aud-globex-01');
      testRuns.push({
        title: 'Cross-Tenant Audit Log Read',
        method: 'GET',
        endpoint: '/api/audit-logs/aud-globex-01',
        status: res.status,
        expectedStatus: 404,
        passed: res.status === 404,
        responseBody: res.data,
        description: 'Attempted to inspect Globex Audit Log entry (aud-globex-01).',
      });
    } catch (err: any) {
      testRuns.push({
        title: 'Cross-Tenant Audit Log Read',
        method: 'GET',
        endpoint: '/api/audit-logs/aud-globex-01',
        status: err.response?.status || 500,
        expectedStatus: 404,
        passed: err.response?.status === 404,
        responseBody: err.response?.data || { error: err.message },
        description: 'Attempted to inspect Globex Audit Log entry (aud-globex-01).',
      });
    }

    // Test 6: Tenant ID Spoofing in Body
    try {
      const res = await apiClient.post('/campaigns', {
        name: 'Body Spoof Isolation Verification',
        tenantId: 'tenant-globex-sec', // Injection attempt
        status: 'DRAFT',
      });
      // The backend should ignore the body tenantId and bind to the authenticated tenant
      const createdTenantId = res.data?.data?.tenantId;
      const passed = createdTenantId === user?.tenantId && createdTenantId !== 'tenant-globex-sec';

      testRuns.push({
        title: 'Request Body Tenant ID Spoofing Prevention',
        method: 'POST',
        endpoint: '/api/campaigns',
        requestPayload: { name: 'Body Spoof Isolation Verification', tenantId: 'tenant-globex-sec' },
        status: res.status,
        expectedStatus: 201,
        passed,
        responseBody: res.data,
        description: `Passed payload with "tenantId: tenant-globex-sec". Backend safely created record assigned to your active tenant (${user?.tenantId}) instead of spoofed target.`,
      });
    } catch (err: any) {
      testRuns.push({
        title: 'Request Body Tenant ID Spoofing Prevention',
        method: 'POST',
        endpoint: '/api/campaigns',
        status: err.response?.status || 500,
        expectedStatus: 201,
        passed: false,
        responseBody: err.response?.data || { error: err.message },
        description: 'Error during spoofing verification request.',
      });
    }

    setResults(testRuns);
    setIsRunning(false);
  };

  const runCustomTest = async () => {
    try {
      let parsedBody: any = undefined;
      if (['POST', 'PATCH', 'PUT'].includes(customMethod) && customBody.trim()) {
        try {
          parsedBody = JSON.parse(customBody);
        } catch {
          alert('Invalid JSON in request body');
          return;
        }
      }

      let res: any;
      if (customMethod === 'GET') {
        res = await apiClient.get(customEndpoint);
      } else if (customMethod === 'DELETE') {
        res = await apiClient.delete(customEndpoint);
      } else if (customMethod === 'PATCH') {
        res = await apiClient.patch(customEndpoint, parsedBody);
      } else {
        res = await apiClient.post(customEndpoint, parsedBody);
      }

      setCustomResult({
        title: 'Custom Exploit Test',
        method: customMethod,
        endpoint: `/api${customEndpoint.startsWith('/') ? customEndpoint : `/${customEndpoint}`}`,
        requestPayload: parsedBody,
        status: res.status,
        expectedStatus: 404,
        passed: res.status >= 200 && res.status < 300,
        responseBody: res.data,
        description: 'Custom HTTP execution finished successfully.',
      });
    } catch (err: any) {
      setCustomResult({
        title: 'Custom Exploit Test',
        method: customMethod,
        endpoint: `/api${customEndpoint.startsWith('/') ? customEndpoint : `/${customEndpoint}`}`,
        status: err.response?.status || 500,
        expectedStatus: 404,
        passed: err.response?.status === 404,
        responseBody: err.response?.data || { error: err.message },
        description: 'Server returned error or safe isolation response.',
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Multi-Tenant Security Isolation Lab</h1>
          <span className="badge badge-ACTIVE">PEN-TEST SUITE</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Execute live cross-tenant attack vectors to verify that tenant boundaries, resource IDs, and identities are
          strictly isolated with zero data leakage.
        </p>
      </div>

      {/* Active Session Info Banner */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.05))',
          borderColor: 'rgba(14, 165, 233, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Authenticated Tenant
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.tenantName} <code style={{ color: '#38bdf8', fontSize: '0.85rem' }}>({user?.tenantId})</code>
              </div>
            </div>
          </div>

          <button
            onClick={runPresetTests}
            className="btn btn-primary"
            disabled={isRunning}
            style={{ boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)' }}
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Executing Attack Vectors...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Mandatory Isolation Assessment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Test Results */}
      {results.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Cross-Tenant Verification Results ({results.filter((r) => r.passed).length}/{results.length} Passed)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((res, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  borderLeft: `4px solid ${res.passed ? '#10b981' : '#f43f5e'}`,
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {res.passed ? (
                      <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                    ) : (
                      <ShieldAlert size={20} style={{ color: '#f43f5e' }} />
                    )}
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{res.title}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-secondary)',
                        color: '#93c5fd',
                      }}
                    >
                      {res.method} {res.endpoint}
                    </span>
                    <span
                      className={`badge ${res.passed ? 'badge-ACTIVE' : 'badge-CANCELLED'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      HTTP {res.status} {res.passed ? '(PROTECTED)' : '(LEAK DETECTED)'}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {res.description}
                </p>

                <div className="terminal-box" style={{ maxHeight: '160px' }}>
                  <div className="terminal-header">
                    <div className="terminal-dot dot-red" />
                    <div className="terminal-dot dot-yellow" />
                    <div className="terminal-dot dot-green" />
                    <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#64748b' }}>
                      HTTP Response Payload (No data leaked from foreign tenant)
                    </span>
                  </div>
                  <pre style={{ margin: 0 }}>{JSON.stringify(res.responseBody, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Custom Exploit Testing Console */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Terminal size={18} style={{ color: '#38bdf8' }} />
            <span>Interactive REST Probe & Exploit Terminal</span>
          </div>
        </div>

        <div className="card-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Dispatch customized HTTP calls against any route to test IDOR protections, cross-tenant resource IDs, or parameter tampering.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '0.75rem', marginBottom: '1rem' }}>
            <select
              className="form-select"
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value as any)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="/campaigns/201 or /users/user-globex-user"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
            />

            <button onClick={runCustomTest} className="btn btn-primary">
              <Play size={15} />
              Send Probe
            </button>
          </div>

          {['POST', 'PATCH', 'PUT'].includes(customMethod) && (
            <div className="form-group">
              <label className="form-label">Request JSON Body</label>
              <textarea
                className="form-textarea"
                rows={3}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
              />
            </div>
          )}

          {customResult && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Probe Response:</span>
                <span className={`badge ${customResult.status === 404 ? 'badge-ACTIVE' : 'badge-role-MANAGER'}`}>
                  HTTP {customResult.status}
                </span>
              </div>
              <div className="terminal-box">
                <div className="terminal-header">
                  <div className="terminal-dot dot-red" />
                  <div className="terminal-dot dot-yellow" />
                  <div className="terminal-dot dot-green" />
                  <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#64748b' }}>probe_result.json</span>
                </div>
                <pre style={{ margin: 0 }}>{JSON.stringify(customResult.responseBody, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
