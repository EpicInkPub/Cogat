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
}

class Storage {
  private leads: Lead[] = [];
  private bonusSignups: BonusSignup[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const storedLeads = localStorage.getItem('leads');
    const storedBonusSignups = localStorage.getItem('bonus_signups');
    
    if (storedLeads) {
      this.leads = JSON.parse(storedLeads);
    }
    if (storedBonusSignups) {
      this.bonusSignups = JSON.parse(storedBonusSignups);
    }
  }

  private saveData() {
    localStorage.setItem('leads', JSON.stringify(this.leads));
    localStorage.setItem('bonus_signups', JSON.stringify(this.bonusSignups));
  }

  addLead(lead: Omit<Lead, 'id' | 'timestamp'>) {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.leads.push(newLead);
    this.saveData();
    return newLead;
  }

  addBonusSignup(email: string) {
    const signup: BonusSignup = {
      id: crypto.randomUUID(),
      email,
      timestamp: Date.now(),
    };
    this.bonusSignups.push(signup);
    this.saveData();
    return signup;
  }

  getLeads() {
    return this.leads;
  }

  getBonusSignups() {
    return this.bonusSignups;
  }

  exportToCSV() {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Package', 'Source', 'Date'];
    const rows = this.leads.map(lead => [
      lead.id,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone,
      lead.package || '',
      lead.source,
      new Date(lead.timestamp).toLocaleString(),
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