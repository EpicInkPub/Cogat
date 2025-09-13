import { database } from './supabase';

// Data storage utilities for leads and form submissions
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  package?: string;
  source: 'test' | 'bonus';
  timestamp: number;
}

export interface BonusSignup {
  id: string;
  email: string;
  timestamp: number;
  source?: string;
  sessionId?: string;
}

export interface FormSubmission {
  id: string;
  type: 'package_order' | 'bonus_signup';
  data: any;
  timestamp: number;
  sessionId?: string;
}

class Storage {
  private leads: Lead[] = [];
  private bonusSignups: BonusSignup[] = [];
  private formSubmissions: FormSubmission[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const storedLeads = localStorage.getItem('leads');
    const storedBonusSignups = localStorage.getItem('bonus_signups');
    const storedFormSubmissions = localStorage.getItem('form_submissions');
    
    if (storedLeads) {
      this.leads = JSON.parse(storedLeads);
    }
    if (storedBonusSignups) {
      this.bonusSignups = JSON.parse(storedBonusSignups);
    }
    if (storedFormSubmissions) {
      this.formSubmissions = JSON.parse(storedFormSubmissions);
    }
  }

  private saveData() {
    localStorage.setItem('leads', JSON.stringify(this.leads));
    localStorage.setItem('bonus_signups', JSON.stringify(this.bonusSignups));
    localStorage.setItem('form_submissions', JSON.stringify(this.formSubmissions));
  }

  async addLead(lead: Omit<Lead, 'id' | 'timestamp'>) {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.leads.push(newLead);
    
    // Save to Supabase database
    try {
      await database.insertLead({
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        package_selected: lead.package || 'unknown',
        grade_selected: lead.package || 'unknown',
        source: lead.source,
        session_id: newLead.id
      });
    } catch (error) {
      console.error('Failed to save lead to database:', error);
    }
    
    // Also save as form submission for detailed tracking
    this.addFormSubmission('package_order', newLead);
    
    this.saveData();
    return newLead;
  }

  async addBonusSignup(email: string, sessionId?: string) {
    const signup: BonusSignup = {
      id: crypto.randomUUID(),
      email,
      timestamp: Date.now(),
      sessionId,
    };
    this.bonusSignups.push(signup);
    
    // Save to Supabase database
    try {
      await database.insertBonusSignup({
        email,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Failed to save bonus signup to database:', error);
    }
    
    // Also save as form submission for detailed tracking
    this.addFormSubmission('bonus_signup', { email, sessionId });
    
    this.saveData();
    return signup;
  }

  addFormSubmission(type: FormSubmission['type'], data: any, sessionId?: string) {
    const submission: FormSubmission = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      sessionId,
    };
    this.formSubmissions.push(submission);
    this.saveData();
    return submission;
  }

  getLeads() {
    return this.leads;
  }

  getBonusSignups() {
    return this.bonusSignups;
  }

  getFormSubmissions() {
    return this.formSubmissions;
  }

  getDataSummary() {
    return {
      totalLeads: this.leads.length,
      totalBonusSignups: this.bonusSignups.length,
      totalFormSubmissions: this.formSubmissions.length,
      leadsBySource: this.leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      leadsByPackage: this.leads.reduce((acc, lead) => {
        const pkg = lead.package || 'unknown';
        acc[pkg] = (acc[pkg] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: [
        ...this.leads.slice(-5).map(l => ({ type: 'lead', data: l })),
        ...this.bonusSignups.slice(-5).map(b => ({ type: 'bonus', data: b }))
      ].sort((a, b) => b.data.timestamp - a.data.timestamp)
    };
  }

  exportToCSV() {
    const headers = ['Type', 'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Package', 'Source', 'Date'];
    const rows = this.leads.map(lead => [
      'Lead',
      lead.id,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone,
      lead.package || '',
      lead.source,
      new Date(lead.timestamp).toLocaleString(),
    ]);

    // Add bonus signups to CSV
    const bonusRows = this.bonusSignups.map(signup => [
      'Bonus Signup',
      signup.id,
      '',
      '',
      signup.email,
      '',
      '',
      'bonus',
      new Date(signup.timestamp).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  exportToJSON() {
    return JSON.stringify({
      leads: this.leads,
      bonusSignups: this.bonusSignups,
      formSubmissions: this.formSubmissions,
      summary: this.getDataSummary(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  downloadExport(format: 'csv' | 'json') {
    const data = format === 'csv' ? this.exportToCSV() : this.exportToJSON();
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cogat-leads-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const storage = new Storage();