import React, { useState, useEffect } from 'react';
import { Calculator, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

const ErrCalculator = () => {
  const [inputs, setInputs] = useState({
    likes: '',
    comments: '',
    shares: '',
    views: ''
  });
  
  const [result, setResult] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isAnomaly, setIsAnomaly] = useState(false); // NEW: Track impossible stats

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setInputs(prev => ({ ...prev, [name]: value }));
    }
  };

  const reset = () => {
    setInputs({ likes: '', comments: '', shares: '', views: '' });
    setResult(0);
    setIsAnomaly(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(`${result}%`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const L = parseInt(inputs.likes) || 0;
    const C = parseInt(inputs.comments) || 0;
    const S = parseInt(inputs.shares) || 0;
    const V = parseInt(inputs.views) || 0;
    
    const totalEngagement = L + C + S;

    if (V > 0) {
      // SAFETY CHECK: If engagement is higher than views, it's likely an error
      if (totalEngagement > V) {
        setIsAnomaly(true);
        setResult(((totalEngagement / V) * 100).toFixed(2));
      } else {
        setIsAnomaly(false);
        const err = (totalEngagement / V) * 100;
        setResult(err.toFixed(2));
      }
    } else {
      setResult(0);
      setIsAnomaly(false);
    }
  }, [inputs]);

  const getQuality = (val) => {
    if (isAnomaly) return { label: 'Statistical Anomaly', color: '#ef4444' }; // Red warning
    const num = parseFloat(val);
    if (num === 0) return { label: 'Waiting for data...', color: '#64748b' };
    if (num < 1) return { label: 'Low Engagement', color: '#ef4444' }; 
    if (num < 3.5) return { label: 'Average Performance', color: '#eab308' }; 
    if (num < 6) return { label: 'High Performance', color: '#3b82f6' }; 
    return { label: '🚀 VIRAL STATUS', color: '#22c55e' }; 
  };

  const quality = getQuality(result);

  return (
    <div style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
         <p style={{ color: '#94a3b8', fontSize: '14px' }}>
           Calculate Engagement Rate by Reach using the standard formula:
           <br/>
           <code style={{ background: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#cbd5e1', marginTop: '8px', display: 'inline-block' }}>
             ((Likes + Comments + Shares) / Views) × 100
           </code>
         </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* INPUTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {['likes', 'comments', 'shares', 'views'].map((field) => (
             <div key={field} style={{ position: 'relative' }}>
               <label style={{ 
                 position: 'absolute', top: '-8px', left: '12px', background: '#1e293b', 
                 padding: '0 6px', fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase'
               }}>
                 {field}
               </label>
               <input 
                 name={field}
                 value={inputs[field]}
                 onChange={handleInputChange}
                 placeholder="0"
                 style={{
                   width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', 
                   padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box'
                 }}
               />
             </div>
           ))}
           <button onClick={reset} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
             <RotateCcw size={14} /> Reset Fields
           </button>
        </div>

        {/* RESULTS */}
        <div style={{ 
          background: '#0f172a', borderRadius: '16px', border: isAnomaly ? '1px solid #ef4444' : '1px solid #334155', 
          padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
          position: 'relative', overflow: 'hidden'
        }}>
           
           <div style={{ zIndex: 1, textAlign: 'center', width: '100%' }}>
             <h4 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
               Calculated ERR
             </h4>
             
             {/* Dynamic Font Size based on length */}
             <div style={{ 
               fontSize: result.toString().length > 6 ? '32px' : '48px', // Shrink font if number is huge
               fontWeight: '900', color: '#fff', marginBottom: '8px', lineHeight: 1, wordBreak: 'break-all' 
             }}>
               {parseFloat(result).toLocaleString()}%
             </div>

             <div style={{ 
               color: quality.color, fontSize: '13px', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', 
               padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px'
             }}>
               {isAnomaly && <AlertTriangle size={14}/>}
               {quality.label}
             </div>

             {isAnomaly && (
               <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px', maxWidth: '200px', lineHeight: '1.4' }}>
                 Note: Engagement count exceeds Views. Please verify your input data.
               </p>
             )}
           </div>

           <button
             onClick={copyResult}
             disabled={parseFloat(result) === 0}
             style={{
               marginTop: '24px', zIndex: 1, background: copied ? '#22c55e' : '#1e293b', border: '1px solid',
               borderColor: copied ? '#22c55e' : '#475569', color: copied ? '#fff' : '#cbd5e1', padding: '10px 20px',
               borderRadius: '8px', cursor: parseFloat(result) === 0 ? 'not-allowed' : 'pointer', display: 'flex',
               alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
             }}
           >
             {copied ? <Check size={16}/> : <Copy size={16}/>}
             {copied ? 'Copied!' : 'Copy Result'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ErrCalculator;