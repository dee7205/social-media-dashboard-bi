import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, 
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Globe, Users, Heart, Filter, X, Loader } from 'lucide-react';
import Papa from 'papaparse';

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    region: null,
    platform: null,
    contentType: null,
    hashtag: null,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
  const loadCSV = async () => {
    try {
      const response = await fetch('/Cleaned_Viral_Social_Media_Trends_FINAL.csv');
      if (!response.ok) throw new Error('CSV file not found');

      const csvText = await response.text();
      
      Papa.parse(csvText, {
        worker: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const transformedData = results.data
            .filter(row => row.Post_Date && row.Views)
            .map((row, idx) => {
              const views = parseInt(row.Views) || 0;
              const likes = parseInt(row.Likes) || 0;
              const comments = parseInt(row.Comments) || 0;
              const shares = parseInt(row.Shares) || 0;
              const err = parseFloat(row['ERR%']) || 0;
              const errLevel = row.ERR_Level || 'Unknown';
              
              return {
                id: idx,
                date: row.Post_Date,
                platform: row.Platform || 'Unknown',
                region: row.Region || 'Unknown',
                contentType: row.Content_Type || 'Unknown',
                hashtag: row.Hashtag || '#General',
                views,
                likes,
                comments,
                shares,
                err,
                errLevel
              };
            });
          
          setAllData(transformedData);
          setLoading(false);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(`Error loading CSV: ${err.message}`);
      setLoading(false);
    }
  };

  loadCSV(); /* loads csv */
  }, []);

  const uniqueRegions = useMemo(() =>
  [...new Set(allData.map(d => d.region))].filter(Boolean).sort(),
  [allData]
  );
  const uniquePlatforms = useMemo(() =>
  [...new Set(allData.map(d => d.platform))].filter(Boolean).sort(),
  [allData]
  );
  const uniqueContentTypes = useMemo(() =>
  [...new Set(allData.map(d => d.contentType))].filter(Boolean).sort(),
  [allData]
  );
  const uniqueHashtags = useMemo(() =>
  [...new Set(allData.map(d => d.hashtag))].filter(Boolean).sort(),
  [allData]
  );

  const filteredData = useMemo(() => {
  return allData.filter(item => {
  if (filters.region && item.region !== filters.region) return false;
  if (filters.platform && item.platform !== filters.platform) return false;
  if (filters.contentType && item.contentType !== filters.contentType) return false;
  if (filters.hashtag && item.hashtag !== filters.hashtag) return false;
  return true;
  });
  }, [allData, filters]);

  const metrics = useMemo(() => {
  const totalViews = filteredData.reduce((sum, d) => sum + d.views, 0);
  const totalLikes = filteredData.reduce((sum, d) => sum + d.likes, 0);
  const totalComments = filteredData.reduce((sum, d) => sum + d.comments, 0);
  const totalShares = filteredData.reduce((sum, d) => sum + d.shares, 0);
  const avgErr = filteredData.length > 0
  ? (filteredData.reduce((sum, d) => sum + d.err, 0) / filteredData.length).toFixed(2)
  : 0;

  return { totalViews, totalLikes, totalComments, totalShares, avgErr };
  }, [filteredData]);

  const getRegionData = () => {
    const grouped = {};
      filteredData.forEach(d => {
        if (!grouped[d.region]) 
          grouped[d.region] = { views: 0, err: 0, count: 0 };
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

  const getPlatformContentStats = () => {
    const lookup = {};
    
    filteredData.forEach(d => {
      const key = `${d.platform}|${d.contentType}`;
      if (!lookup[key]) lookup[key] = { err: 0, count: 0 };
      lookup[key].err += d.err;
      lookup[key].count += 1;
    });

    // 2. Format for Recharts: Group by Platform
    const platforms = [...new Set(filteredData.map(d => d.platform))];
    const contentTypes = [...new Set(filteredData.map(d => d.contentType))];

    return platforms.map(platform => {
      const row = { name: platform };
      contentTypes.forEach(type => {
        const key = `${platform}|${type}`;
        if (lookup[key]) {
          row[type] = parseFloat((lookup[key].err / lookup[key].count).toFixed(2));
        } else {
          row[type] = 0;
        }
      });
      return row;
    });
  };

  const getPlatformData = () => {
  const grouped = {};
  filteredData.forEach(d => {
  if (!grouped[d.platform]) grouped[d.platform] = { views: 0 };
  grouped[d.platform].views += d.views;
  });
  return Object.entries(grouped).map(([platform, data]) => ({
  platform,
  views: data.views
  }));
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
  return Object.entries(grouped)
  .map(([date, data]) => ({
  date,
  err: (data.err / data.count).toFixed(2)
  }))
  .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getHashtagData = () => {
  const grouped = {};
  filteredData.forEach(d => {
  if (!grouped[d.hashtag]) grouped[d.hashtag] = { err: 0, count: 0 };
  grouped[d.hashtag].err += d.err;
  grouped[d.hashtag].count += 1;
  });
  return Object.entries(grouped)
  .map(([hashtag, data]) => ({
  hashtag,
  err: (data.err / data.count).toFixed(2)
  }))
  .sort((a, b) => b.err - a.err);
  };

  const getScatterData = () => {
      return filteredData
        // Sort by views descending to show the most relevant data points
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

  const handleFilterChange = (key, value) => {
  setFilters(prev => ({
  ...prev,
  [key]: prev[key] === value ? null : value
  }));
  };

  const clearAllFilters = () => {
  setFilters({ region: null, platform: null, contentType: null, hashtag: null });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== null).length;

  if (loading) { return ( <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <div style={{ textAlign: 'center' }}> <Loader style={{ width: '48px', height: '48px', color: 'rgb(65, 66, 67)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} /> <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>Loading cleaned data...</p> </div> </div> ); }

  if (error) { return ( <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}> <div style={{ background: '#7c2d12', border: '1px solid #b45309', borderRadius: '8px', padding: '32px', maxWidth: '500px', textAlign: 'center' }}> <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>⚠️ Error</h2> <p style={{ color: '#fecaca', marginBottom: '16px' }}>{error}</p> <p style={{ color: '#fed7aa', fontSize: '14px' }}> Make sure <code style={{ background: '#92400e', padding: '4px 8px', borderRadius: '4px' }}>Cleaned_Data_Dashboard.csv</code> is in the <code style={{ background: '#92400e', padding: '4px 8px', borderRadius: '4px' }}>public</code> folder </p> </div> </div> ); }

  return ( <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', padding: '24px', color: '#fff' }}> <div style={{ marginBottom: '32px' }}> <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Viral Social Media Analytics</h1> <p style={{ color: '#94a3b8' }}>Cleaned data from {allData.length.toLocaleString()} posts | ERR anomalies filtered</p> </div>

    {/* Filter Section */}
    <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Filters</h2>
          {activeFilterCount > 0 && <span style={{ background: '#2563eb', color: '#fff', fontSize: '12px', padding: '4px 8px', borderRadius: '9999px' }}>{activeFilterCount} active</span>}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          {showFilters ? <X style={{ width: '20px', height: '20px' }} /> : <Filter style={{ width: '20px', height: '20px' }} />}
        </button>
      </div>

      {showFilters && (
        <>
          {uniqueRegions.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px', textTransform: 'uppercase' }}>Region</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniqueRegions.map(region => (
                  <button
                    key={region}
                    onClick={() => handleFilterChange('region', region)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid',
                      cursor: 'pointer',
                      background: filters.region === region ? '#2563eb' : '#475569',
                      color: filters.region === region ? '#fff' : '#cbd5e1',
                      borderColor: filters.region === region ? '#1e40af' : '#334155'
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniquePlatforms.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px', textTransform: 'uppercase' }}>Platform</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniquePlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handleFilterChange('platform', platform)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid',
                      cursor: 'pointer',
                      background: filters.platform === platform ? '#2563eb' : '#475569',
                      color: filters.platform === platform ? '#fff' : '#cbd5e1',
                      borderColor: filters.platform === platform ? '#1e40af' : '#334155'
                    }}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueContentTypes.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px', textTransform: 'uppercase' }}>Content Type</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniqueContentTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange('contentType', type)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid',
                      cursor: 'pointer',
                      background: filters.contentType === type ? '#2563eb' : '#475569',
                      color: filters.contentType === type ? '#fff' : '#cbd5e1',
                      borderColor: filters.contentType === type ? '#1e40af' : '#334155'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueHashtags.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px', textTransform: 'uppercase' }}>Hashtag</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uniqueHashtags.map(hashtag => (
                  <button
                    key={hashtag}
                    onClick={() => handleFilterChange('hashtag', hashtag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid',
                      cursor: 'pointer',
                      background: filters.hashtag === hashtag ? '#2563eb' : '#475569',
                      color: filters.hashtag === hashtag ? '#fff' : '#cbd5e1',
                      borderColor: filters.hashtag === hashtag ? '#1e40af' : '#334155'
                    }}
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                width: '100%',
                background: '#475569',
                color: '#cbd5e1',
                padding: '8px',
                borderRadius: '6px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Clear All Filters
            </button>
          )}
        </>
      )}
      
      <p style={{ color: '#64748b', fontSize: '14px', marginTop: '16px' }}>
        Showing <span style={{ color: '#60a5fa', fontWeight: '600' }}>{filteredData.length.toLocaleString()}</span> of <span style={{ fontWeight: '600' }}>{allData.length.toLocaleString()}</span> records
      </p>
    </div>

    {/* Metrics Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>🌍 Total Views</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.totalViews.toLocaleString()}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Filtered data</div>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>❤️ Total Likes</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.totalLikes.toLocaleString()}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>User engagement</div>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>💬 Total Comments</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.totalComments.toLocaleString()}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Interactions</div>
      </div>
      <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase' }}>📈 Avg Engagement Rate</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{metrics.avgErr}%</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>ERR metric</div>
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
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
        Bubble size represents total <strong>Shares</strong>. Larger bubbles = higher virality.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          
          <XAxis 
            dataKey="likes" 
            type="number" 
            stroke="#94a3b8" 
            name="Likes" 
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
            label={{ value: 'Likes', position: 'bottom', offset: 0, fill: '#94a3b8' }}
          />
          
          <YAxis 
            dataKey="comments" 
            type="number" 
            stroke="#94a3b8" 
            name="Comments" 
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Comments', angle: -90, position: 'left', offset: 0, fill: '#94a3b8' }}
          />
          
          {/* THIS CONTROLS THE BUBBLE SIZE */}
          <ZAxis 
            type="number" 
            dataKey="shares" 
            range={[60, 600]} 
            name="Shares" 
          />

          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
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
            }}
          />
          
          {/* I added fillOpacity to see overlapping bubbles */}
          <Scatter name="Posts" data={getScatterData()} fill="#3b82f6" fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>

    <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        Best Content Type per Platform
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
        Comparing average ERR to find the optimal content format for each app.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={getPlatformContentStats()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            cursor={{fill: '#334155'}}
          />
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

      <div style={{ background: 'linear-gradient(to bottom right, #92400e, #1e293b)', border: '1px solid #b45309', borderRadius: '8px', padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>⚡ Data Summary</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>📊 Cleaned Records: <strong>{filteredData.length.toLocaleString()}</strong></li>
          <li style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>✅ Quality: <strong>Filtered</strong></li>
          <li style={{ fontSize: '14px', color: '#e2e8f0' }}>📈 Avg ERR: <strong>{metrics.avgErr}%</strong></li>
        </ul> {/* End of Data Summary*/}
      </div> {/*End of individual Insight*/ }

      <div style={{ background: 'linear-gradient(to bottom right, #be123c, #1e293b)', border: '1px solid #fb7185', borderRadius: '8px', padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>💡 Content Optimization Strategy</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
             <li style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
              <strong>For TikTok:</strong> Focus on <u>Live Streams</u> (Highest ERR)
            </li>
            <li style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
              <strong>For YouTube:</strong> <u>Shorts</u> outperform standard Videos by 12%
            </li>
             <li style={{ fontSize: '14px', color: '#e2e8f0' }}>
              <strong>General Trend:</strong> Short-form video is the dominant format across all regions.
            </li>
        </ul>
      </div>
    </div> {/* End of Insights Grid*/}
  </div> // End of Dashboard
  );
};

export default Dashboard;