'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  User
} from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'GOVERNMENT';
};

type Service = {
  id: string;
  name: string;
  fee: string;
  time: string;
  eligibility: string;
  docs: string[];
};

type AppRecord = {
  id: string;
  userEmail: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'in_process' | 'approved' | 'rejected';
  formData: Record<string, string>;
  uploadedFiles: Array<{ name: string; path: string }>;
  history: Array<{ status: string; note: string; createdAt: string }>;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_process: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

export default function HomePage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserType | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [applications, setApplications] = useState<AppRecord[]>([]);
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pending: 0,
    in_process: 0,
    approved: 0,
    rejected: 0
  });
  const [message, setMessage] = useState('');
  const [loginData, setLoginData] = useState({
    email: 'user@shewadigital.in',
    password: 'password123'
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    aadhaar: '',
    address: '',
    state: '',
    district: ''
  });
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; path: string }>>([]);

  const t = {
    en: {
      brand: 'ShewaDigital',
      subtitle: 'AI-powered government service portal',
      login: 'Login',
      register: 'Register',
      home: 'Home',
      services: 'Services',
      tracker: 'Application Tracker',
      gov: 'Government Portal',
      profile: 'Profile',
      dashboard: 'Dashboard'
    },
    hi: {
      brand: 'शेवा डिजिटल',
      subtitle: 'AI-संचालित सार्वजनिक सेवा पोर्टल',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      home: 'होम',
      services: 'सेवाएं',
      tracker: 'एप्लिकेशन ट्रैकिंग',
      gov: 'सरकारी पोर्टल',
      profile: 'प्रोफाइल',
      dashboard: 'डैशबोर्ड'
    }
  }[lang];

  useEffect(() => {
    const saved = localStorage.getItem('shewadigital-user');
    if (saved) {
      setUser(JSON.parse(saved));
    }

    loadServices();
    loadDashboard();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('shewadigital-user', JSON.stringify(user));
      loadApplications(user.email);
    }
  }, [user]);

  async function loadServices() {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
    setSelectedService(data[0] || null);
  }

  async function loadDashboard() {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    setDashboard(data);
  }

  async function loadApplications(email: string) {
    const res = await fetch(`/api/applications?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setApplications(data || []);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Login failed');
      return;
    }

    setUser(data.user);
    setMessage('Login successful');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Registration failed');
      return;
    }

    setMessage('Registration successful. Please login.');
    setAuthMode('login');
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const formDataToSend = new FormData();

    files.forEach((file) => formDataToSend.append('files', file));

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formDataToSend
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Upload failed');
      return;
    }

    setUploadedFiles(data.files || []);
    setMessage('Documents uploaded successfully');
  }

  async function submitApplication() {
    if (!user || !selectedService) {
      setMessage('Please login and select a service.');
      return;
    }

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        formData,
        uploadedFiles
      })
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Application failed');
      return;
    }

    setMessage('Application submitted successfully');
    setFormData({});
    setUploadedFiles([]);
    loadApplications(user.email);
    loadDashboard();
  }

  async function updateStatus(appId: string, status: 'pending' | 'in_process' | 'approved' | 'rejected') {
    const res = await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note: `Status updated to ${status}` })
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Status update failed');
      return;
    }

    setMessage('Status updated');
    loadApplications(user?.email || 'user@shewadigital.in');
    loadDashboard();
  }

  const userApplications = useMemo(
    () => applications.filter((app) => app.userEmail === user?.email),
    [applications, user]
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-blue-700">{t.brand}</div>

          <nav className="hidden gap-6 md:flex">
            <button>{t.home}</button>
            <button>{t.services}</button>
            <button>{t.tracker}</button>
            <button>{t.gov}</button>
          </nav>

          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'hi')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>

            {user ? (
              <button
                className="rounded-lg border border-slate-200 px-3 py-2"
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem('shewadigital-user');
                }}
              >
                Logout
              </button>
            ) : (
              <button className="rounded-lg bg-blue-700 px-4 py-2 text-white">{t.login}</button>
            )}
          </div>
        </div>
      </header>

      {!user ? (
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-500 p-8 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-100">AI Document Assistant</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">{t.subtitle}</h1>
              <p className="mt-4 max-w-lg text-blue-100">
                Upload documents, let AI extract key fields, review them, and track the approval pipeline.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <Sparkles className="mb-2" />
                  <div className="font-semibold">AI Fill</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <FileText className="mb-2" />
                  <div className="font-semibold">OCR</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <ShieldCheck className="mb-2" />
                  <div className="font-semibold">Approval</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="mb-5 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                className={`flex-1 rounded-xl px-4 py-2 font-medium ${authMode === 'login' ? 'bg-white shadow' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                {t.login}
              </button>
              <button
                className={`flex-1 rounded-xl px-4 py-2 font-medium ${authMode === 'register' ? 'bg-white shadow' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                {t.register}
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <label className="block text-sm font-medium">
                  Email
                  <input
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Password
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white">
                  {t.login}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <label className="block text-sm font-medium">
                  Full Name
                  <input
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Email
                  <input
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Phone
                  <input
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Password
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white">
                  {t.register}
                </button>
              </form>
            )}

            {message && <div className="mt-4 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</div>}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Users</div>
              <div className="mt-2 text-3xl font-bold text-blue-700">{dashboard.totalUsers}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Applications</div>
              <div className="mt-2 text-3xl font-bold text-blue-700">{dashboard.totalApplications}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Pending</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">{dashboard.pending}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Approved</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{dashboard.approved}</div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.85fr_1.9fr]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-700"><User size={18} /></div>
                  <h3 className="text-xl font-bold">{t.profile}</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div><span className="font-medium text-slate-900">Name:</span> {user.name}</div>
                  <div><span className="font-medium text-slate-900">Email:</span> {user.email}</div>
                  <div><span className="font-medium text-slate-900">Role:</span> {user.role}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-indigo-100 p-2 text-indigo-700"><Building2 size={18} /></div>
                  <h3 className="text-xl font-bold">Government Office</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div><span className="font-medium text-slate-900">Office:</span> State Service Portal</div>
                  <div><span className="font-medium text-slate-900">Department:</span> Digital Governance Division</div>
                  <div><span className="font-medium text-slate-900">Location:</span> Patna, Bihar</div>
                </div>
              </div>
            </aside>

            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-full bg-cyan-100 p-2 text-cyan-700"><ClipboardList size={18} /></div>
                  <h3 className="text-xl font-bold">{t.services}</h3>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`rounded-2xl border p-4 text-left ${selectedService?.id === service.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className="text-lg font-semibold">{service.name}</div>
                      <div className="mt-2 text-sm text-slate-600">{service.fee} • {service.time}</div>
                    </button>
                  ))}
                </div>

                {selectedService && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h4 className="text-xl font-semibold">{selectedService.name}</h4>
                    <p className="mt-2 text-sm text-slate-600">{selectedService.eligibility}</p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {selectedService.docs.map((doc) => (
                        <label key={doc} className="block text-sm font-medium text-slate-700">
                          {doc}
                          <input
                            value={formData[doc] || ''}
                            onChange={(e) => setFormData({ ...formData, [doc]: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-medium text-slate-700">
                        Upload documents
                        <input type="file" multiple onChange={handleUpload} className="mt-2 block w-full text-sm text-slate-500" />
                      </label>

                      {uploadedFiles.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm text-slate-600">
                          {uploadedFiles.map((file) => (
                            <li key={file.path}>• {file.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button onClick={submitApplication} className="mt-6 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white">
                      Submit Application
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-700"><CheckCircle2 size={18} /></div>
                  <h3 className="text-xl font-bold">Application Tracker</h3>
                </div>

                <div className="space-y-4">
                  {userApplications.length === 0 ? (
                    <p className="text-sm text-slate-500">No applications found.</p>
                  ) : (
                    userApplications.map((app) => (
                      <div key={app.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{app.serviceName}</div>
                            <div className="text-xs text-slate-500">{app.id}</div>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[app.status]}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-slate-600">
                          {app.history.map((entry, index) => (
                            <div key={`${entry.status}-${index}`} className="mt-2 border-t border-slate-200 pt-2">
                              <div className="font-medium">{entry.status}</div>
                              <div className="text-xs">{entry.note}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {user.role === 'GOVERNMENT' && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-full bg-violet-100 p-2 text-violet-700"><ShieldCheck size={18} /></div>
                    <h3 className="text-xl font-bold">Government Approval Panel</h3>
                  </div>

                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{app.serviceName}</div>
                            <div className="text-xs text-slate-500">{app.userEmail}</div>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[app.status]}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            onClick={() => updateStatus(app.id, 'in_process')}
                          >
                            In process
                          </button>
                          <button
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                            onClick={() => updateStatus(app.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                            onClick={() => updateStatus(app.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
