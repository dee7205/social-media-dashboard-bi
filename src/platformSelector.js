import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Sparkles, MapPin, Video, Hash } from 'lucide-react';

const PlatformSelector = ({ 
  uniqueRegions, 
  uniqueContentTypes, 
  uniqueHashtags, 
  filters, 
  onFilterChange, 
  recommendations 
}) => {
  const [showResults, setShowResults] = useState(false);

  // Hide results if the user changes a filter
  useEffect(() => {
    setShowResults(false);
  }, [filters]);

  const handlePredictClick = () => {
    setShowResults(true);
  };

  const isSelectionComplete = filters.region && filters.contentType && filters.hashtag;

  // Helper to get Rank Colors
  const getRankStyles = (index) => {
    switch (index) {
      case 0: return { border: '1px solid #22c55e', bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', label: '🏆 Best Choice', shadow: '0 0 15px rgba(34, 197, 94, 0.2)' };
      case 1: return { border: '1px solid #eab308', bg: 'rgba(234, 179, 8, 0.1)', text: '#facc15', label: '🥈 Strong Alternative', shadow: 'none' };
      case 2: return { border: '1px solid #f97316', bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c', label: '🥉 Viable Option', shadow: 'none' };
      default: return { border: '1px solid #ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', label: '⚠️ Low Potential', shadow: 'none' };
    }
  };

  return (
    // FIXED: Balanced padding (24px) and proper box-sizing
    <div style={{ width: '100%', padding: '0 28px 28px 28px', boxSizing: 'border-box' }}> 
      
      {/* Increased top margin to separate from the Modal Header */}
      <div style={{ margin: '24px 0 32px 0', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Select your target parameters below to generate an AI-driven platform recommendation.
        </p>
      </div>

      {/* Grid with 24px GAP for better separation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        
        {/* Region Selector */}
        <div style={{ 
          background: '#0f172a', 
          padding: '24px', // Increased internal padding 
          borderRadius: '16px', 
          border: '1px solid #1e293b', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16}/> Target Region
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uniqueRegions.map(region => (
              <button
                key={region}
                onClick={() => onFilterChange('region', region)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: filters.region === region ? '1px solid #3b82f6' : '1px solid transparent',
                  background: filters.region === region ? '#2563eb' : '#1e293b',
                  color: filters.region === region ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: filters.region === region ? '600' : '400',
                  boxShadow: filters.region === region ? '0 2px 12px rgba(37, 99, 235, 0.4)' : 'none',
                  flexGrow: 1,
                  textAlign: 'center'
                }}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Selector */}
        <div style={{ 
          background: '#0f172a', 
          padding: '24px', // Increased internal padding
          borderRadius: '16px', 
          border: '1px solid #1e293b', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#a78bfa', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={16}/> Content Format
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uniqueContentTypes.map(type => (
              <button
                key={type}
                onClick={() => onFilterChange('contentType', type)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: filters.contentType === type ? '1px solid #8b5cf6' : '1px solid transparent',
                  background: filters.contentType === type ? '#7c3aed' : '#1e293b',
                  color: filters.contentType === type ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: filters.contentType === type ? '600' : '400',
                  boxShadow: filters.contentType === type ? '0 2px 12px rgba(124, 58, 237, 0.4)' : 'none',
                  flexGrow: 1,
                  textAlign: 'center'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtag Selector */}
        <div style={{ 
          background: '#0f172a', 
          padding: '24px', // Increased internal padding
          borderRadius: '16px', 
          border: '1px solid #1e293b', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#f472b6', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={16}/> Hashtag Category
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uniqueHashtags.map(hash => (
              <button
                key={hash}
                onClick={() => onFilterChange('hashtag', hash)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: filters.hashtag === hash ? '1px solid #ec4899' : '1px solid transparent',
                  background: filters.hashtag === hash ? '#db2777' : '#1e293b',
                  color: filters.hashtag === hash ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: filters.hashtag === hash ? '600' : '400',
                  boxShadow: filters.hashtag === hash ? '0 2px 12px rgba(219, 39, 119, 0.4)' : 'none',
                  flexGrow: 1,
                  textAlign: 'center'
                }}
              >
                {hash}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handlePredictClick}
        disabled={!isSelectionComplete}
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '12px',
          border: 'none',
          background: isSelectionComplete 
            ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
            : '#1e293b',
          color: isSelectionComplete ? '#fff' : '#475569',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: isSelectionComplete ? 'pointer' : 'not-allowed',
          marginBottom: '24px',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: isSelectionComplete ? '0 4px 20px rgba(59, 130, 246, 0.5)' : 'none',
          opacity: isSelectionComplete ? 1 : 0.7
        }}
      >
        <Sparkles size={20} fill={isSelectionComplete ? "white" : "none"} />
        {isSelectionComplete ? 'Generate Recommendation' : 'Select options to start'}
      </button>

      {/* Results Section */}
      {showResults && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {recommendations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {recommendations.map((rec, index) => {
                const styles = getRankStyles(index);
                return (
                  <div 
                    key={rec.platform}
                    style={{
                      background: styles.bg,
                      border: styles.border,
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: styles.shadow,
                      transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ 
                      fontSize: '11px', 
                      color: styles.text, 
                      marginBottom: '10px', 
                      textTransform: 'uppercase', 
                      fontWeight: '800',
                      letterSpacing: '0.5px'
                    }}>
                      {styles.label}
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                      {rec.platform}
                    </div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', opacity: 0.8 }}>
                      Decay Score: <strong>{rec.errorRate.toFixed(4)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} />
              <span>No historical data found for this exact combination. Try changing one filter.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;