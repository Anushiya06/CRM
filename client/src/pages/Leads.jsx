import React, { useEffect, useState } from "react";
import { 
  RefreshCw, 
  UserPlus, 
  Plus, 
  FileText, 
  PhoneCall, 
  Calendar, 
  Clock, 
  History, 
  ChevronRight, 
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import api from "../api";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("timeline");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // New Lead Form State
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadIntent, setNewLeadIntent] = useState("GENERAL");
  const [newLeadStatus, setNewLeadStatus] = useState("WARM");

  // Interaction Forms State
  const [noteText, setNoteText] = useState("");
  
  const [callStatus, setCallStatus] = useState("Connected");
  const [callOutcome, setCallOutcome] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [callDate, setCallDate] = useState("");

  const [meetingSummary, setMeetingSummary] = useState("");
  const [meetingDecisions, setMeetingDecisions] = useState("");
  const [meetingDate, setMeetingDate] = useState("");

  const [reminderNote, setReminderNote] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  // Fetch leads on mount
  const loadLeads = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.get("/leads");
      // Map mock values to fields if the backend hasn't been connected yet (keeps Phase 3 fully functional)
      const sanitizedLeads = res.data.map(lead => ({
        ...lead,
        notes: lead.notes || [],
        callHistory: lead.callHistory || [],
        meetingNotes: lead.meetingNotes || [],
        reminders: lead.reminders || []
      }));
      setLeads(sanitizedLeads);
      
      // Keep selected lead sync'd if one is open
      if (selectedLead) {
        const updated = sanitizedLeads.find(l => l._id === selectedLead._id);
        if (updated) setSelectedLead(updated);
      }
    } catch (err) {
      console.error(err);
      // Fallback for Phase 3 static testing if backend APIs are not running
      setErrorMessage("Could not load leads from server. Displaying mock data for frontend demonstration.");
      const mockData = [
        {
          _id: "mock-1",
          phone: "+91 98765 43210",
          lastMessage: "Interested in buying product catalog standard.",
          status: "HOT",
          intent: "PURCHASE",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          notes: [
            { id: "n1", text: "Spoke to customer. He runs a logistics firm and wants pricing.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() }
          ],
          callHistory: [
            { id: "c1", status: "Connected", outcome: "Discussed bulk order requirements", duration: 5, date: new Date(Date.now() - 86400000 * 2).toISOString() }
          ],
          meetingNotes: [],
          reminders: [
            { id: "r1", note: "Send quotation catalog", date: new Date(Date.now() + 86400000).toISOString(), status: "PENDING" }
          ]
        },
        {
          _id: "mock-2",
          phone: "+91 87654 32109",
          lastMessage: "General inquiry on business hours.",
          status: "WARM",
          intent: "GENERAL",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          notes: [],
          callHistory: [],
          meetingNotes: [],
          reminders: []
        }
      ];
      setLeads(mockData);
      if (selectedLead) {
        const updated = mockData.find(l => l._id === selectedLead._id);
        setSelectedLead(updated || mockData[0]);
      } else {
        setSelectedLead(mockData[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Add new lead manually
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLeadPhone) return;

    try {
      await api.post("/webhook", { phone: newLeadPhone, message: `Manual lead created. Intent: ${newLeadIntent}` });
      setNewLeadPhone("");
      setShowAddLead(false);
      loadLeads();
    } catch (err) {
      // Mock insert for local testing
      const newLead = {
        _id: `mock-${Date.now()}`,
        phone: newLeadPhone,
        lastMessage: "Manually registered lead.",
        status: newLeadStatus,
        intent: newLeadIntent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        callHistory: [],
        meetingNotes: [],
        reminders: []
      };
      setLeads([newLead, ...leads]);
      setSelectedLead(newLead);
      setNewLeadPhone("");
      setShowAddLead(false);
    }
  };

  // Convert lead to customer
  const convertToCustomer = async (lead) => {
    const name = window.prompt("Enter customer full name:", `Customer ${lead.phone}`);
    if (!name) return;
    const email = window.prompt("Enter customer email (optional):", "");
    
    try {
      await api.post(`/customers/from-lead/${lead._id}`, { name, email });
      loadLeads();
    } catch (err) {
      // Mock transition locally
      const updatedLeads = leads.map(l => {
        if (l._id === lead._id) {
          return { ...l, status: "CONVERTED" };
        }
        return l;
      });
      setLeads(updatedLeads);
      setSelectedLead({ ...lead, status: "CONVERTED" });
      alert("Converted successfully (local mockup state updated).");
    }
  };

  // Log Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText,
      createdAt: new Date().toISOString()
    };

    try {
      // Post to backend (endpoint will be hooked up in Phase 4)
      await api.post(`/leads/${selectedLead._id}/notes`, { text: noteText });
      loadLeads();
    } catch (err) {
      // Offline fallback state update for Phase 3 preview
      const updatedLead = {
        ...selectedLead,
        notes: [...(selectedLead.notes || []), newNote]
      };
      updateLocalLeadState(updatedLead);
    }
    setNoteText("");
  };

  // Log Call
  const handleLogCall = async (e) => {
    e.preventDefault();
    if (!callOutcome.trim()) return;

    const newCall = {
      id: `call-${Date.now()}`,
      status: callStatus,
      outcome: callOutcome,
      duration: Number(callDuration) || 0,
      date: callDate ? new Date(callDate).toISOString() : new Date().toISOString()
    };

    try {
      await api.post(`/leads/${selectedLead._id}/calls`, newCall);
      loadLeads();
    } catch (err) {
      const updatedLead = {
        ...selectedLead,
        callHistory: [...(selectedLead.callHistory || []), newCall]
      };
      updateLocalLeadState(updatedLead);
    }

    setCallOutcome("");
    setCallDuration("");
    setCallDate("");
  };

  // Log Meeting
  const handleLogMeeting = async (e) => {
    e.preventDefault();
    if (!meetingSummary.trim()) return;

    const newMeeting = {
      id: `meet-${Date.now()}`,
      summary: meetingSummary,
      decisions: meetingDecisions,
      date: meetingDate ? new Date(meetingDate).toISOString() : new Date().toISOString()
    };

    try {
      await api.post(`/leads/${selectedLead._id}/meetings`, newMeeting);
      loadLeads();
    } catch (err) {
      const updatedLead = {
        ...selectedLead,
        meetingNotes: [...(selectedLead.meetingNotes || []), newMeeting]
      };
      updateLocalLeadState(updatedLead);
    }

    setMeetingSummary("");
    setMeetingDecisions("");
    setMeetingDate("");
  };

  // Add Reminder
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!reminderNote.trim() || !reminderDate) return;

    const newReminder = {
      id: `rem-${Date.now()}`,
      note: reminderNote,
      date: new Date(reminderDate).toISOString(),
      status: "PENDING"
    };

    try {
      await api.post(`/leads/${selectedLead._id}/reminders`, newReminder);
      loadLeads();
    } catch (err) {
      const updatedLead = {
        ...selectedLead,
        reminders: [...(selectedLead.reminders || []), newReminder]
      };
      updateLocalLeadState(updatedLead);
    }

    setReminderNote("");
    setReminderDate("");
  };

  // Toggle Reminder Status
  const toggleReminderStatus = async (reminderId) => {
    try {
      await api.patch(`/leads/${selectedLead._id}/reminders/${reminderId}`);
      loadLeads();
    } catch (err) {
      const updatedReminders = (selectedLead.reminders || []).map(r => {
        if (r.id === reminderId) {
          return { ...r, status: r.status === "PENDING" ? "COMPLETED" : "PENDING" };
        }
        return r;
      });
      const updatedLead = {
        ...selectedLead,
        reminders: updatedReminders
      };
      updateLocalLeadState(updatedLead);
    }
  };

  // Local helper for frontend preview
  const updateLocalLeadState = (updatedLead) => {
    setSelectedLead(updatedLead);
    setLeads(leads.map(l => l._id === updatedLead._id ? updatedLead : l));
  };

  // Search filter
  const filteredLeads = leads.filter(lead => 
    lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.intent && lead.intent.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.status && lead.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Generate interaction timeline event array
  const getTimelineEvents = (lead) => {
    if (!lead) return [];
    const events = [];

    // 1. Initial Capture
    events.push({
      id: "evt-created",
      type: "CREATION",
      title: "Lead Captured",
      date: lead.createdAt || Date.now(),
      description: lead.lastMessage || "Lead initiated contact."
    });

    // 2. Notes
    (lead.notes || []).forEach(n => {
      events.push({
        id: n.id || `n-${n.createdAt}`,
        type: "NOTE",
        title: "Note Added",
        date: n.createdAt,
        description: n.text
      });
    });

    // 3. Calls
    (lead.callHistory || []).forEach(c => {
      events.push({
        id: c.id || `c-${c.date}`,
        type: "CALL",
        title: "Call Logged",
        date: c.date,
        description: `Status: ${c.status} | Duration: ${c.duration} mins | Outcome: ${c.outcome}`
      });
    });

    // 4. Meetings
    (lead.meetingNotes || []).forEach(m => {
      events.push({
        id: m.id || `m-${m.date}`,
        type: "MEETING",
        title: "Meeting Logged",
        date: m.date,
        description: `Agenda: ${m.summary} | Decisions: ${m.decisions}`
      });
    });

    // 5. Reminders
    (lead.reminders || []).forEach(r => {
      events.push({
        id: r.id || `r-${r.date}`,
        type: "REMINDER",
        title: `Reminder Scheduled (${r.status})`,
        date: r.date,
        description: `Follow-up plan: ${r.note}`
      });
    });

    // 6. Conversion
    if (lead.status === "CONVERTED") {
      events.push({
        id: "evt-converted",
        type: "CONVERSION",
        title: "Lead Converted",
        date: lead.updatedAt || Date.now(),
        description: "Successfully converted to lifetime customer directory."
      });
    }

    // Sort newest events first
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const timelineEvents = selectedLead ? getTimelineEvents(selectedLead) : [];

  return (
    <section className="leads-section">
      <div className="page-header">
        <div>
          <h1>Lead Hub</h1>
          <p>Manage potential clients, record discussions, and track reminders prior to conversion.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-soft" onClick={loadLeads} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddLead(!showAddLead)}>
            <Plus size={16} /> New Lead
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-warning">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Manual Lead Form Modal-Like Card */}
      {showAddLead && (
        <div className="panel form-panel animate-slide">
          <h3>Add New Lead Manually</h3>
          <form onSubmit={handleCreateLead} className="lead-quick-form">
            <div className="form-row">
              <input 
                type="text" 
                className="input" 
                placeholder="Phone Number (e.g., +91 99999 99999)" 
                value={newLeadPhone}
                onChange={(e) => setNewLeadPhone(e.target.value)}
                required
              />
              <select className="input" value={newLeadIntent} onChange={(e) => setNewLeadIntent(e.target.value)}>
                <option value="GENERAL">General Interest</option>
                <option value="PURCHASE">High Purchase Intent</option>
                <option value="SUPPORT">Support / Inquiry</option>
              </select>
              <select className="input" value={newLeadStatus} onChange={(e) => setNewLeadStatus(e.target.value)}>
                <option value="WARM">Warm</option>
                <option value="HOT">Hot</option>
              </select>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-soft" onClick={() => setShowAddLead(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="leads-layout">
        {/* Left Column: Leads List */}
        <div className="leads-list-panel panel">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search by phone, status, or intent..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="leads-items">
            {filteredLeads.map((lead) => (
              <div 
                key={lead._id} 
                className={`lead-item-card ${selectedLead?._id === lead._id ? "selected" : ""}`}
                onClick={() => setSelectedLead(lead)}
              >
                <div className="lead-card-header">
                  <span className="lead-phone">{lead.phone}</span>
                  <span className={`status-badge ${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </div>
                <p className="lead-message">{lead.lastMessage || "No messages recorded."}</p>
                <div className="lead-card-footer">
                  <span className="intent-badge">{lead.intent}</span>
                  <span className="time-ago">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <ChevronRight size={16} className="card-arrow" />
              </div>
            ))}
            {filteredLeads.length === 0 && (
              <p className="empty-msg">No matching leads found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Selected Lead Details & Interaction Hub */}
        <div className="leads-detail-panel panel">
          {selectedLead ? (
            <div className="lead-hub-details animate-fade">
              <div className="detail-header">
                <div>
                  <h2>{selectedLead.phone}</h2>
                  <div className="badges-row">
                    <span className={`status-badge ${selectedLead.status.toLowerCase()}`}>
                      Status: {selectedLead.status}
                    </span>
                    <span className="intent-badge">
                      Intent: {selectedLead.intent}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  disabled={selectedLead.status === "CONVERTED"}
                  onClick={() => convertToCustomer(selectedLead)}
                >
                  <UserPlus size={16} /> Convert to Customer
                </button>
              </div>

              {/* Tabs for details */}
              <div className="detail-tabs">
                <button 
                  className={`tab-btn ${activeTab === "timeline" ? "active" : ""}`}
                  onClick={() => setActiveTab("timeline")}
                >
                  <History size={16} /> Timeline
                </button>
                <button 
                  className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
                  onClick={() => setActiveTab("notes")}
                >
                  <FileText size={16} /> Notes
                </button>
                <button 
                  className={`tab-btn ${activeTab === "calls" ? "active" : ""}`}
                  onClick={() => setActiveTab("calls")}
                >
                  <PhoneCall size={16} /> Calls
                </button>
                <button 
                  className={`tab-btn ${activeTab === "meetings" ? "active" : ""}`}
                  onClick={() => setActiveTab("meetings")}
                >
                  <Calendar size={16} /> Meetings
                </button>
                <button 
                  className={`tab-btn ${activeTab === "reminders" ? "active" : ""}`}
                  onClick={() => setActiveTab("reminders")}
                >
                  <Clock size={16} /> Reminders
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="tab-content-panel">
                
                {/* 1. Timeline Tab */}
                {activeTab === "timeline" && (
                  <div className="timeline-view">
                    <h3>Activity Feed</h3>
                    <div className="timeline-path">
                      {timelineEvents.map((evt, idx) => (
                        <div key={evt.id} className={`timeline-node ${evt.type.toLowerCase()}`}>
                          <div className="node-marker"></div>
                          <div className="node-content">
                            <div className="node-header">
                              <h4>{evt.title}</h4>
                              <span className="node-time">
                                {new Date(evt.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="node-details">{evt.description}</p>
                          </div>
                        </div>
                      ))}
                      {timelineEvents.length === 0 && (
                        <p className="empty-msg">No timeline history recorded.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Notes Tab */}
                {activeTab === "notes" && (
                  <div className="notes-tab-view">
                    <form onSubmit={handleAddNote} className="log-action-form">
                      <h4>Log Customer Note</h4>
                      <textarea 
                        className="input textarea" 
                        placeholder="Write details about the discussion, specific needs..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={3}
                        required
                      />
                      <button type="submit" className="btn btn-primary">Add Note</button>
                    </form>

                    <div className="action-history-list">
                      <h4>Logged Notes ({selectedLead.notes?.length || 0})</h4>
                      {(selectedLead.notes || []).slice().reverse().map(note => (
                        <div key={note.id} className="history-item">
                          <p className="history-text">{note.text}</p>
                          <span className="history-meta">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {!selectedLead.notes?.length && (
                        <p className="empty-msg">No notes recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Calls Tab */}
                {activeTab === "calls" && (
                  <div className="calls-tab-view">
                    <form onSubmit={handleLogCall} className="log-action-form">
                      <h4>Log Call Details</h4>
                      <div className="input-grid">
                        <div className="form-group">
                          <label className="label">Call Status</label>
                          <select className="input" value={callStatus} onChange={(e) => setCallStatus(e.target.value)}>
                            <option value="Connected">Connected</option>
                            <option value="Busy">Busy</option>
                            <option value="No Answer">No Answer</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Duration (minutes)</label>
                          <input 
                            type="number" 
                            className="input" 
                            placeholder="5" 
                            value={callDuration}
                            onChange={(e) => setCallDuration(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="label">Call Date</label>
                          <input 
                            type="datetime-local" 
                            className="input" 
                            value={callDate}
                            onChange={(e) => setCallDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="label">Call Outcome Summary</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Interested in bulk order, requested custom quote"
                          value={callOutcome}
                          onChange={(e) => setCallOutcome(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">Log Call</button>
                    </form>

                    <div className="action-history-list">
                      <h4>Call History ({selectedLead.callHistory?.length || 0})</h4>
                      {(selectedLead.callHistory || []).slice().reverse().map(call => (
                        <div key={call.id} className="history-item">
                          <div className="history-header">
                            <span className={`status-pill ${call.status.toLowerCase()}`}>{call.status}</span>
                            <span className="history-meta">{call.duration} mins</span>
                          </div>
                          <p className="history-text">{call.outcome}</p>
                          <span className="history-meta">
                            {new Date(call.date).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {!selectedLead.callHistory?.length && (
                        <p className="empty-msg">No calls logged yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Meetings Tab */}
                {activeTab === "meetings" && (
                  <div className="meetings-tab-view">
                    <form onSubmit={handleLogMeeting} className="log-action-form">
                      <h4>Record Meeting Notes</h4>
                      <div className="form-group">
                        <label className="label">Meeting Date & Time</label>
                        <input 
                          type="datetime-local" 
                          className="input" 
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Meeting Agenda / Summary</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Discussed pricing models and contract duration."
                          value={meetingSummary}
                          onChange={(e) => setMeetingSummary(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Decisions & Key Agreements</label>
                        <textarea 
                          className="input textarea" 
                          placeholder="Agreed to send custom contract proposal by Friday. Next meeting set."
                          value={meetingDecisions}
                          onChange={(e) => setMeetingDecisions(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">Save Meeting Notes</button>
                    </form>

                    <div className="action-history-list">
                      <h4>Meeting Records ({selectedLead.meetingNotes?.length || 0})</h4>
                      {(selectedLead.meetingNotes || []).slice().reverse().map(m => (
                        <div key={m.id} className="history-item">
                          <p className="history-text"><strong>Summary:</strong> {m.summary}</p>
                          {m.decisions && <p className="history-text"><strong>Decisions:</strong> {m.decisions}</p>}
                          <span className="history-meta">
                            {new Date(m.date).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {!selectedLead.meetingNotes?.length && (
                        <p className="empty-msg">No meetings logged yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Reminders Tab */}
                {activeTab === "reminders" && (
                  <div className="reminders-tab-view">
                    <form onSubmit={handleAddReminder} className="log-action-form">
                      <h4>Schedule Follow-up Reminder</h4>
                      <div className="input-grid">
                        <div className="form-group">
                          <label className="label">Reminder Date & Time</label>
                          <input 
                            type="datetime-local" 
                            className="input" 
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="label">Follow-up Note</label>
                          <input 
                            type="text" 
                            className="input" 
                            placeholder="Call lead to discuss discount rates"
                            value={reminderNote}
                            onChange={(e) => setReminderNote(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">Schedule</button>
                    </form>

                    <div className="action-history-list">
                      <h4>Reminders Scheduled ({selectedLead.reminders?.length || 0})</h4>
                      {(selectedLead.reminders || []).slice().reverse().map(rem => (
                        <div key={rem.id} className={`reminder-item ${rem.status.toLowerCase()}`}>
                          <div className="reminder-header">
                            <span className="reminder-meta-date">
                              Due: {new Date(rem.date).toLocaleString()}
                            </span>
                            <button 
                              className={`btn-toggle-status ${rem.status === "COMPLETED" ? "completed" : "pending"}`}
                              onClick={() => toggleReminderStatus(rem.id)}
                              title={rem.status === "COMPLETED" ? "Mark Pending" : "Mark Completed"}
                            >
                              <CheckCircle size={18} />
                            </button>
                          </div>
                          <p className="reminder-text">{rem.note}</p>
                        </div>
                      ))}
                      {!selectedLead.reminders?.length && (
                        <p className="empty-msg">No reminders scheduled yet.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="no-lead-selected">
              <History size={48} className="placeholder-icon" />
              <h3>No Lead Selected</h3>
              <p>Select a lead from the directory to review notes, history, reminders, and timelines.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
