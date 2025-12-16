import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, 
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Filter, X, Loader, Sparkles, Bot } from 'lucide-react';
import Papa from 'papaparse';
import PlatformSelector from './platformSelector';
import { Calculator } from 'lucide-react'; // Add Calculator to the import list from 'lucide-react'
import ErrCalculator from './ERRCalculator'; // Import the new component

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggregatedData, setAggregatedData] = useState([]);

  // Dashboard Filters
  const [filters, setFilters] = useState({
    region: null,
    platform: null,
    contentType: null,
    hashtag: null,
  });

  // AI Recommender Filters
  const [aggFilters, setAggFilters] = useState({
    region: null,
    contentType: null,
    hashtag: null
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showErrModal, setShowErrModal] = useState(false);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/Cleaned_Viral_Social_Media_Trends_FINAL.csv');
        const otherResponse = await fetch('/For_Platform_Predicting.csv');

        if (!response.ok) throw new Error('Main CSV file not found');
        
        const csvText = await response.text();
        const otherCsvText = await otherResponse.text();

        // 1. Parse Main Data
        Papa.parse(csvText, {
          worker: true,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const transformedData = results.data
              .filter(row => row.Post_Date && row.Views)
              .map((row, idx) => ({
                id: idx,
                date: row.Post_Date,
                platform: row.Platform || 'Unknown',
                region: row.Region || 'Unknown',
                contentType: row.Content_Type || 'Unknown',
                hashtag: row.Hashtag || '#General',
                views: parseInt(row.Views) || 0,
                likes: parseInt(row.Likes) || 0,
                comments: parseInt(row.Comments) || 0,
                shares: parseInt(row.Shares) || 0,
                err: parseFloat(row['ERR%']) || 0,
                errLevel: row.ERR_Level || 'Unknown',
              }));
            setAllData(transformedData);
          },
          error: (error) => { setError("Error parsing main CSV"); }
        });

         // 2. Parse AI Data
         Papa.parse(otherCsvText, {
          worker: true,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const importedData = results.data
              .filter(row => row.Platform)
              .map((row) => ({ 
                platform: row.Platform || 'Unknown', 
                hashtag: row.Hashtag || '#General', 
                contentType: row.Content_Type || 'Unknown', 
                region: row.Region || 'Unknown', 
                decayedErr: parseFloat(row.Decayed_ERR) || 0 
              }));
            setAggregatedData(importedData);
            setLoading(false);
          },
          error: (error) => { console.error(error); }
        });

      } catch (err) {
        setError(`Error loading CSV: ${err.message}`);
        setLoading(false);
      }
    };
    loadCSV();
  }, []);
          
  // Memorize unique values
  const uniqueRegions = useMemo(() => [...new Set(allData.map(d => d.region))].filter(Boolean).sort(), [allData]);
  const uniquePlatforms = useMemo(() => [...new Set(allData.map(d => d.platform))].filter(Boolean).sort(), [allData]);
  const uniqueContentTypes = useMemo(() => [...new Set(allData.map(d => d.contentType))].filter(Boolean).sort(), [allData]);
  const uniqueHashtags = useMemo(() => [...new Set(allData.map(d => d.hashtag))].filter(Boolean).sort(), [allData]);

  // Filters
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      if (filters.region && item.region !== filters.region) return false;
      if (filters.platform && item.platform !== filters.platform) return false;
      if (filters.contentType && item.contentType !== filters.contentType) return false;
      if (filters.hashtag && item.hashtag !== filters.hashtag) return false;
      return true;
    });
  }, [allData, filters]);

  const filteredAggData = useMemo(() => {
      return aggregatedData.filter(item => {
        if (aggFilters.region && item.region !== aggFilters.region) return false;
        if (aggFilters.contentType && item.contentType !== aggFilters.contentType) return false;
        if (aggFilters.hashtag && item.hashtag !== aggFilters.hashtag) return false;
        return true;
      });
  }, [aggregatedData, aggFilters]);

  // Metrics & Chart Data Helpers
  const metrics = useMemo(() => {
    const totalViews = filteredData.reduce((sum, d) => sum + d.views, 0);
    const totalLikes = filteredData.reduce((sum, d) => sum + d.likes, 0);
    const totalComments = filteredData.reduce((sum, d) => sum + d.comments, 0);
    const avgErr = filteredData.length > 0 
    ? (filteredData.reduce((sum, d) => sum + d.err, 0) / filteredData.length).toFixed(2)
    : 0;
    return { totalViews, totalLikes, totalComments, avgErr };
  }, [filteredData]);

  const getRegionData = () => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.region]) grouped[d.region] = { views: 0, err: 0, count: 0 };
      grouped[d.region].views += d.views;
      grouped[d.region].err += d.err;
      grouped[d.region].count += 1;
    });
    return Object.entries(grouped).map(([region, data]) => ({
      region,
      views: data.views,
      err: (data.err / data.count).toFixed(2)
    })).sort((a, b) => b.views - a.views);
  };

  const getPlatformData = () => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.platform]) grouped[d.platform] = { views: 0 };
      grouped[d.platform].views += d.views;
    });
    return Object.entries(grouped).map(([platform, data]) => ({ platform, views: data.views }));
  };

  const getContentTypeData = () => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.contentType]) grouped[d.contentType] = { err: 0, count: 0 };
      grouped[d.contentType].err += d.err;
      grouped[d.contentType].count += 1;
    });
    return Object.entries(grouped).map(([type, data]) => ({
      type,
      err: (data.err / data.count).toFixed(2)
    })).sort((a, b) => b.err - a.err);
  };

  const getTrendData = () => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { err: 0, count: 0 };
      grouped[d.date].err += d.err;
      grouped[d.date].count += 1;
    });
    return Object.entries(grouped).map(([date, data]) => ({
      date,
      err: (data.err / data.count).toFixed(2)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getHashtagData = () => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.hashtag]) grouped[d.hashtag] = { err: 0, count: 0 };
      grouped[d.hashtag].err += d.err;
      grouped[d.hashtag].count += 1;
    });
    return Object.entries(grouped).map(([hashtag, data]) => ({
      hashtag,
      err: (data.err / data.count).toFixed(2)
    })).sort((a, b) => b.err - a.err);
  };

  const getScatterData = () => {
    return filteredData
      .sort((a, b) => b.views - a.views) 
      .slice(0, 100)
      .map(d => ({
        likes: d.likes,
        comments: d.comments,
        shares: d.shares,
        content: d.contentType,
        errLevel: d.errLevel
      }));
  };

  const getERRLevelDistribution = () => {
    const grouped = { 'Low': 0, 'Average': 0, 'High': 0, 'Excellent': 0 };
    filteredData.forEach(d => {
      grouped[d.errLevel] = (grouped[d.errLevel] || 0) + 1;
    });
    return Object.entries(grouped).map(([level, count]) => ({ level, count }));
  };

  const getPlatformContentStats = () => {
    const lookup = {};
    filteredData.forEach(d => {
      const key = `${d.platform}|${d.contentType}`;
      if (!lookup[key]) lookup[key] = { err: 0, count: 0 };
      lookup[key].err += d.err;
      lookup[key].count += 1;
    });
    const platforms = [...new Set(filteredData.map(d => d.platform))];
    const contentTypes = [...new Set(filteredData.map(d => d.contentType))];
    return platforms.map(platform => {
      const row = { name: platform };
      contentTypes.forEach(type => {
        const key = `${platform}|${type}`;
        row[type] = lookup[key] ? parseFloat((lookup[key].err / lookup[key].count).toFixed(2)) : 0;
      });
      return row;
    });
  };

  // AI Recommender Functions
  const handleAggFilterChange = (key, value) => {
    setAggFilters(prev => ({
        ...prev,
        [key]: prev[key] === value ? null : value
      }));
  };

  const getSuggestedPlatforms = () => {
    const rankedPlatforms = {};
    filteredAggData.forEach((data) => {
      if (!rankedPlatforms[data.platform]) {
          rankedPlatforms[data.platform] = { platform : data.platform, decayedErr : 0 };
      }
      if (data.decayedErr > rankedPlatforms[data.platform].decayedErr) {
         rankedPlatforms[data.platform].decayedErr = data.decayedErr;
      }
    });
    const rankedArray = Object.values(rankedPlatforms);
    rankedArray.sort((a, b) => b.decayedErr - a.decayedErr);
    return rankedArray.map(item => ({
      platform: item.platform,
      errorRate: item.decayedErr
    }));
  }

  // Dashboard UI Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const clearAllFilters = () => {
    setFilters({ region: null, platform: null, contentType: null, hashtag: null });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== null).length;

  // Loading / Error States
  if (loading) return ( <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader className="animate-spin text-white w-12 h-12" /></div> );
  if (error) return ( <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">{error}</div> );

  return ( 
  <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', padding: '24px', color: '#fff', position: 'relative' }}> 
    
    {/* Header Area */}
    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}> 
      <div>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Viral Social Media Analytics</h1> 
        <p style={{ color: '#94a3b8' }}>Cleaned data from {allData.length.toLocaleString()} posts | ERR anomalies filtered</p> 
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setShowAIModal(true)}
          style={{
            background: 'linear-gradient(to right, #7c3aed, #db2777)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
          }}
        >
          <Sparkles size={18} /> AI Strategist
        </button>

        {/* NEW: ERR Calculator Button */}
        <button
          onClick={() => setShowErrModal(true)}
          style={{
            background: '#1e293b', // Darker background to differentiate
            border: '1px solid #475569',
            color: '#e2e8f0',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#334155'}
          onMouseLeave={(e) => e.target.style.background = '#1e293b'}
        >
          <Calculator size={18} /> ERR Calculator
        </button>
      </div>
    </div>

    {/* Main Filters (Collapsible) */}
    <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '16px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Dashboard Filters</h2>
          {activeFilterCount > 0 && <span style={{ background: '#2563eb', color: '#fff', fontSize: '12px', padding: '2px 8px', borderRadius: '9999px' }}>{activeFilterCount} active</span>}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {showFilters ? <><X size={16}/> Hide</> : <><Filter size={16}/> Show</>}
        </button>
      </div>

      {showFilters && (
        <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-in' }}>
          {/* Region */}
          <div style={{ marginBottom: '16px' }}>
             <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Region</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniqueRegions.map(r => (
                  <button key={r} onClick={() => handleFilterChange('region', r)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid', cursor: 'pointer', 
                    background: filters.region === r ? '#2563eb' : '#334155', color: filters.region === r ? '#fff' : '#cbd5e1', borderColor: filters.region === r ? '#1e40af' : '#475569' }}>
                    {r}
                  </button>
                ))}
             </div>
          </div>
          {/* Platform */}
          <div style={{ marginBottom: '16px' }}>
             <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Platform</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniquePlatforms.map(p => (
                  <button key={p} onClick={() => handleFilterChange('platform', p)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid', cursor: 'pointer', 
                    background: filters.platform === p ? '#2563eb' : '#334155', color: filters.platform === p ? '#fff' : '#cbd5e1', borderColor: filters.platform === p ? '#1e40af' : '#475569' }}>
                    {p}
                  </button>
                ))}
             </div>
          </div>
          {/* Content Type - RESTORED */}
          <div style={{ marginBottom: '16px' }}>
             <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Content Type</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniqueContentTypes.map(c => (
                  <button key={c} onClick={() => handleFilterChange('contentType', c)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid', cursor: 'pointer', 
                    background: filters.contentType === c ? '#2563eb' : '#334155', color: filters.contentType === c ? '#fff' : '#cbd5e1', borderColor: filters.contentType === c ? '#1e40af' : '#475569' }}>
                    {c}
                  </button>
                ))}
             </div>
          </div>
          {/* Hashtag - RESTORED */}
          <div style={{ marginBottom: '16px' }}>
             <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Hashtag</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniqueHashtags.map(h => (
                  <button key={h} onClick={() => handleFilterChange('hashtag', h)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid', cursor: 'pointer', 
                    background: filters.hashtag === h ? '#2563eb' : '#334155', color: filters.hashtag === h ? '#fff' : '#cbd5e1', borderColor: filters.hashtag === h ? '#1e40af' : '#475569' }}>
                    {h}
                  </button>
                ))}
             </div>
          </div>

           {/* Clear Button */}
           <div style={{ textAlign: 'right', marginTop: '16px' }}>
             <button onClick={clearAllFilters} style={{ fontSize: '13px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
               Clear All
             </button>
           </div>
        </div>
      )}
    </div>

    {/* Metrics Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>🌍 Total Views</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.totalViews.toLocaleString()}</div>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>❤️ Total Likes</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.totalLikes.toLocaleString()}</div>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>💬 Total Comments</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.totalComments.toLocaleString()}</div>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>📈 Avg ERR</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.avgErr}%</div>
      </div>
    </div>

    {/* Charts Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Engagement Rate by Region</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getRegionData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="region" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
            <Bar dataKey="err" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Platform Views Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={getPlatformData()} dataKey="views" nameKey="platform" cx="50%" cy="50%" outerRadius={100} label>
              <Cell fill="#3b82f6" />
              <Cell fill="#8b5cf6" />
              <Cell fill="#ec4899" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Engagement Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={getTrendData()}>
            <defs>
              <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="err" stroke="#10b981" fillOpacity={1} fill="url(#colorErr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Content Type Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getContentTypeData()} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="type" type="category" stroke="#94a3b8" width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
            <Bar dataKey="err" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Hashtag Engagement Ranking</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getHashtagData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="hashtag" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
            <Bar dataKey="err" fill="#ec4899" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>ERR_Level Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getERRLevelDistribution()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="level" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
            <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        Likes vs Comments (Size = Shares)
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="likes" type="number" stroke="#94a3b8" name="Likes" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} label={{ value: 'Likes', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
          <YAxis dataKey="comments" type="number" stroke="#94a3b8" name="Comments" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} label={{ value: 'Comments', angle: -90, position: 'left', offset: 0, fill: '#94a3b8' }} />
          <ZAxis type="number" dataKey="shares" range={[60, 600]} name="Shares" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div style={{ background: '#1e293b', border: '1px solid #475569', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{data.content}</p>
                  <p style={{ color: '#60a5fa', fontSize: '12px' }}>Likes: {data.likes.toLocaleString()}</p>
                  <p style={{ color: '#a78bfa', fontSize: '12px' }}>Comments: {data.comments.toLocaleString()}</p>
                  <p style={{ color: '#34d399', fontSize: '12px' }}>Shares: {data.shares.toLocaleString()}</p>
                </div>
              );
            }
            return null;
          }}/>
          <Scatter name="Posts" data={getScatterData()} fill="#3b82f6" fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>

    <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Best Content Type per Platform</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={getPlatformContentStats()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} cursor={{fill: '#334155'}} />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
          <Bar dataKey="Video" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Reel" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Post" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Live Stream" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Shorts" fill="#ec4899" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Tweet" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Insights Section */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
      <div style={{ background: 'linear-gradient(to bottom right, #1e3a8a, #1e293b)', border: '1px solid #1e40af', borderRadius: '8px', padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>🎯 Top Regions</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {getRegionData().slice(0, 3).map((r, i) => (
            <li key={r.region} style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
              {'🥇🥈🥉'[i]} <strong>{r.region}:</strong> {r.err}% ERR
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #581c87, #1e293b)', border: '1px solid #7c3aed', borderRadius: '8px', padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>📱 Top Content Types</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {getContentTypeData().slice(0, 3).map((c, i) => (
            <li key={c.type} style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
              {'🥇🥈🥉'[i]} <strong>{c.type}:</strong> {c.err}% ERR
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #065f46, #1e293b)', border: '1px solid #10b981', borderRadius: '8px', padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>🏷️ Top Hashtags</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {getHashtagData().slice(0, 3).map((h, i) => (
            <li key={h.hashtag} style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
              {'🥇🥈🥉'[i]} <strong>{h.hashtag}:</strong> {h.err}% ERR
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #be123c, #1e293b)', border: '1px solid #fb7185', borderRadius: '8px', padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>💡 Content Optimization</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
             <li style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}><strong>TikTok:</strong> Focus on <u>Live Streams</u></li>
            <li style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}><strong>YouTube:</strong> <u>Shorts</u> outperform Videos</li>
             <li style={{ fontSize: '14px', color: '#e2e8f0' }}><strong>General:</strong> Short-form video is dominant.</li>
        </ul>
      </div>
    </div>

      {/* ERR CALCULATOR MODAL */}
      {showErrModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '600px', position: 'relative', animation: 'fadeIn 0.2s ease-out' }}>
          <button 
            onClick={() => setShowErrModal(false)}
            style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
             <div style={{ background: '#0f172a', padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calculator size={24} color="#3b82f6" />
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Quick ERR Calculator</h2>
             </div>
             <div style={{ padding: '24px 0 0 0' }}>
                <ErrCalculator />
             </div>
          </div>
        </div>
      </div>
    )}

    {/* AI STRATEGIST MODAL */}
    {showAIModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '800px', position: 'relative', animation: 'fadeIn 0.2s ease-out' }}>
          <button 
            onClick={() => setShowAIModal(false)}
            style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
             <div style={{ background: '#1e293b', padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bot size={24} color="#a78bfa" />
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>AI Platform Strategist</h2>
             </div>
             <div style={{ padding: '4px' }}>
                <PlatformSelector 
                  uniqueRegions={uniqueRegions}
                  uniqueContentTypes={uniqueContentTypes}
                  uniqueHashtags={uniqueHashtags}
                  filters={aggFilters}
                  onFilterChange={handleAggFilterChange}
                  recommendations={getSuggestedPlatforms()}
                />
             </div>
          </div>
        </div>
      </div>
    )}

  </div>
  );
};

export default Dashboard;