import { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [records, setRecords] = useState([]);
  
  // Filter States
  const [tempVariantFilter, setTempVariantFilter] = useState('all');
  const [appliedVariantFilter, setAppliedVariantFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('am');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Form Visibility State
  const [showForm, setShowForm] = useState(false);

  // Form Data State mapping exactly to your Backend Schema
  const initialFormState = {
    ProductionDate: '',
    shift: 'AM',
    productBatchNumber: '',
    productBatchVariant: 'Beef',
    batchWeight: '',
    fillingTemperature: '',
    actualFillingTemperature: '',
    actualRoomTemperature: '',
    timeEndorsed: '',
    consumedUntil: '',
    productionStatus: 'In Production',
    timeStart: '',
    timeEnd: '',
    monitoredBy: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Data
  const fetchRecords = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/production`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const variantMatch = appliedVariantFilter === 'all' || record.productBatchVariant.toLowerCase() === appliedVariantFilter.toLowerCase();
      return variantMatch;
    });
  }, [records, appliedVariantFilter]);

  const handleApplyFilters = () => {
    setAppliedVariantFilter(tempVariantFilter);
  };

  // KPI Calculations
  const totalWeight = filteredRecords.reduce((sum, rec) => sum + (rec.batchWeight || 0), 0);
  const avgFillTemp = filteredRecords.length ? (filteredRecords.reduce((sum, rec) => sum + (rec.actualFillingTemperature || 0), 0) / filteredRecords.length).toFixed(1) : "0.0";
  const avgRoomTemp = filteredRecords.length ? (filteredRecords.reduce((sum, rec) => sum + (rec.actualRoomTemperature || 0), 0) / filteredRecords.length).toFixed(1) : "0.0";

  // Date/Time Formatters
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle POST Request (Create Record)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Record successfully added!');
        setFormData(initialFormState); // Reset form
        setShowForm(false); // Hide form
        fetchRecords(); // Refresh table and chart instantly
      } else {
        const errorData = await response.json();
        alert('Failed to save record: ' + errorData.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert('Internal server error while communicating with backend.');
    }
  };

  // Handle DELETE Request
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this record?")) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/production/${id}`, { method: 'DELETE' });
        fetchRecords(); 
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  // Chart Configuration
  const chartData = {
    labels: filteredRecords.map(r => `Batch ${r.productBatchNumber}`),
    datasets: [
      {
        label: 'Actual Filling Temp (°C)',
        data: filteredRecords.map(r => r.actualFillingTemperature),
        borderColor: '#0056b3',
        backgroundColor: 'rgba(0, 86, 179, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Target Limit (2.0 °C)',
        data: Array(filteredRecords.length).fill(2.0),
        borderColor: '#dc3545',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">🥟 Pinnacle Quality Food OS</div>
        <div className="navbar-user">👤 Profile: Mauro</div>
      </nav>

      <main className="container">
        <h2>Siomai Line Filling Monitoring</h2>

        {/* Filters */}
        <section className="section-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Start Date</label>
              <input type="date" defaultValue="2024-05-18" />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input type="date" defaultValue="2024-05-18" />
            </div>
            
            <div className="filter-group">
              <label>Variant</label>
              <div className="checkbox-group">
                <label><input type="radio" name="variant" value="all" checked={tempVariantFilter === 'all'} onChange={(e) => setTempVariantFilter(e.target.value)} /> All</label>
                <label><input type="radio" name="variant" value="beef" checked={tempVariantFilter === 'beef'} onChange={(e) => setTempVariantFilter(e.target.value)} /> Beef</label>
                <label><input type="radio" name="variant" value="pork" checked={tempVariantFilter === 'pork'} onChange={(e) => setTempVariantFilter(e.target.value)} /> Pork</label>
                <label><input type="radio" name="variant" value="chicken" checked={tempVariantFilter === 'chicken'} onChange={(e) => setTempVariantFilter(e.target.value)} /> Chicken</label>
              </div>
            </div>

            <div className="filter-group">
              <label>Shift</label>
              <div className="checkbox-group">
                <label><input type="radio" name="shift" value="am" checked={shiftFilter === 'am'} onChange={(e) => setShiftFilter(e.target.value)} /> AM</label>
                <label><input type="radio" name="shift" value="pm" checked={shiftFilter === 'pm'} onChange={(e) => setShiftFilter(e.target.value)} /> PM</label>
              </div>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input type="text" placeholder="Batch or Monitor Name..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
            </div>

            <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'flex-end', paddingTop: '20px' }}>
              <button className="btn" onClick={handleApplyFilters}>Apply Filters</button>
              <button className="btn btn-outline" style={{ marginLeft: '10px' }}>Export CSV</button>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="metrics-grid" style={{ marginBottom: '20px' }}>
          <div className="metric-card"><div className="metric-label">Total Batches</div><div className="metric-value">{filteredRecords.length}</div></div>
          <div className="metric-card"><div className="metric-label">Total Weight (kgs)</div><div className="metric-value">{totalWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div></div>
          <div className="metric-card"><div className="metric-label">Avg Filling Temp</div><div className="metric-value">{avgFillTemp} °C</div></div>
          <div className="metric-card"><div className="metric-label">Avg Room Temp</div><div className="metric-value">{avgRoomTemp} °C</div></div>
          <div className="metric-card" style={{ borderTop: '4px solid var(--primary-blue)' }}><div className="metric-label">Processing Efficiency</div><div className="metric-value">448 <span style={{ fontSize: '1rem', color: '#666' }}>kg/hr</span></div></div>
        </section>

        {/* Chart */}
        <section className="section-panel">
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Temperature Trends by Batch</h3>
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, suggestedMin: 1.5, suggestedMax: 3.0 } } }} />
          </div>
        </section>

        {/* Table & Add Record Form Toggle */}
        <section className="section-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: '0' }}>Production Records</h3>
            <button className="btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel / Close Form' : '+ Add New Record'}
            </button>
          </div>
          
          {/* Add Record Form directly interacting with backend schema */}
          {showForm && (
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ marginTop: 0 }}>Add New Production Record</h4>
              <form onSubmit={handleFormSubmit}>
                <div className="filters-grid">
                  <div className="filter-group"><label>Production Date</label><input type="date" name="ProductionDate" value={formData.ProductionDate} onChange={handleInputChange} required /></div>
                  <div className="filter-group">
                    <label>Shift</label>
                    <select name="shift" value={formData.shift} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      <option value="AM">AM</option><option value="PM">PM</option>
                    </select>
                  </div>
                  <div className="filter-group"><label>Batch Number</label><input type="text" name="productBatchNumber" value={formData.productBatchNumber} onChange={handleInputChange} required /></div>
                  <div className="filter-group">
                    <label>Variant</label>
                    <select name="productBatchVariant" value={formData.productBatchVariant} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      <option value="Beef">Beef</option><option value="Pork">Pork</option><option value="Chicken">Chicken</option>
                    </select>
                  </div>
                  <div className="filter-group"><label>Weight (kgs)</label><input type="number" step="0.1" name="batchWeight" value={formData.batchWeight} onChange={handleInputChange} required /></div>
                  <div className="filter-group"><label>Target Fill Temp</label><input type="number" step="0.1" name="fillingTemperature" value={formData.fillingTemperature} onChange={handleInputChange} required /></div>
                  <div className="filter-group"><label>Actual Fill Temp (°C)</label><input type="number" step="0.1" name="actualFillingTemperature" value={formData.actualFillingTemperature} onChange={handleInputChange} required /></div>
                  <div className="filter-group"><label>Actual Room Temp (°C)</label><input type="number" step="0.1" name="actualRoomTemperature" value={formData.actualRoomTemperature} onChange={handleInputChange} required /></div>
                  <div className="filter-group"><label>Consume Until</label><input type="date" name="consumedUntil" value={formData.consumedUntil} onChange={handleInputChange} required /></div>
                  <div className="filter-group">
                    <label>Status</label>
                    <select name="productionStatus" value={formData.productionStatus} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      <option value="In Production">In Production</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="filter-group"><label>Time Endorsed</label><input type="datetime-local" name="timeEndorsed" value={formData.timeEndorsed} onChange={handleInputChange} required /></div>
                  <div className="filter-group"><label>Time Start</label><input type="datetime-local" name="timeStart" value={formData.timeStart} onChange={handleInputChange} required /></div>
                  <div className="filter-group"><label>Time End</label><input type="datetime-local" name="timeEnd" value={formData.timeEnd} onChange={handleInputChange} /></div>
                  <div className="filter-group"><label>Monitored By</label><input type="text" name="monitoredBy" value={formData.monitoredBy} onChange={handleInputChange} required /></div>
                  
                  <div className="filter-group" style={{ width: '100%', marginTop: '10px' }}>
                    <button type="submit" className="btn">Save Record to Database</button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Batch</th>
                  <th>Variant</th>
                  <th>Endorsed</th>
                  <th>Weight (kg)</th>
                  <th>Target (°C)</th>
                  <th>Act. Temp (°C)</th>
                  <th>Room Temp (°C)</th>
                  <th>Consume By</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Monitor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan="15" style={{textAlign: 'center', padding: '20px'}}>No matching records found.</td></tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id}>
                      <td>#{record.productBatchNumber.padStart(3, '0')}</td> 
                      <td>{formatDate(record.ProductionDate)}</td>
                      <td>{record.productBatchNumber}</td>
                      <td><span className={`badge badge-${record.productBatchVariant.toLowerCase()}`}>{record.productBatchVariant}</span></td>
                      <td>{formatTime(record.timeEndorsed)}</td>
                      <td>{record.batchWeight}</td>
                      <td>{record.fillingTemperature}</td>
                      <td>{record.actualFillingTemperature}</td>
                      <td>{record.actualRoomTemperature}</td>
                      <td>{formatDate(record.consumedUntil)}</td>
                      <td>{formatTime(record.timeStart)}</td>
                      <td>{formatTime(record.timeEnd)}</td>
                      <td>{record.productionStatus}</td>
                      <td>{record.monitoredBy}</td>
                      <td className="action-links">
                        <button className="delete" onClick={() => handleDelete(record._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;