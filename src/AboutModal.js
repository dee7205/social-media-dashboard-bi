import React from 'react';
import { Database, TrendingUp, Activity, Calculator, X } from 'lucide-react';

const AboutModal = ({ onClose }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '24px' }}>
      
      {/* WRAPPER DIV */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 70 }}
        >
          <X size={20} />
        </button>

        {/* SCROLLABLE CONTENT */}
        <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', overflowY: 'auto', width: '100%', maxHeight: '100%' }}>

          {/* Header */}
          <div style={{ background: '#1e293b', padding: '24px', borderBottom: '1px solid #334155' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity color="#3b82f6" /> About Project & Methodology
            </h2>
            <p style={{ color: '#94a3b8', marginTop: '8px' }}>
              Data-driven strategies for maximizing social media impact.
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', color: '#cbd5e1' }}>
            
            {/* UPDATED: Project Description */}
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🚀 Project Overview</h3>
              <p style={{ lineHeight: '1.6', fontSize: '14px', marginBottom: '12px' }}>
                This project focuses on analyzing social media trends across various platforms and geographic regions. 
                By assessing <strong>Engagement Rates by Reach (ERR)</strong>—calculated based on a post’s likes, shares, comments, and views—the study tracks fields and topics that effectively yield higher engagement across diverse viewer bases.
              </p>
              <p style={{ lineHeight: '1.6', fontSize: '14px' }}>
                This analysis enables Influencers and Content Creators to strategize future content based on data-driven insights. 
                Additionally, determining what type of content captures the most viewer interest allows for better algorithmic visibility. 
                Optimizing for these metrics boosts content to a wider audience range, thereby increasing the likelihood of viewer trust and follower growth rate.
              </p>
            </section>

            {/* UPDATED: Dataset Specification */}
            <section style={{ marginBottom: '32px', background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Database size={18} color="#a78bfa" />
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Dataset Description</h3>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                This project used the <strong>Viral Social Media Trends Dataset</strong> from Kaggle, containing <strong>5,000 samples</strong> and 11 columns.
              </p>
              
              {/* Feature List Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Post_ID:</strong> Unique identifier</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Platform:</strong> Instagram, TikTok, Youtube, Twitter</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Hashtag:</strong> #Challenge, #Comedy, #Dance, etc.</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Content_Type:</strong> Video, Reel, Post, Shorts, Tweet</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Region:</strong> USA, UK, Brazil, India, Japan, etc.</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Views:</strong> Number of views per post</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Likes/Shares/Comments:</strong> Interaction metrics</div>
                <div style={{ color: '#94a3b8' }}>• <strong style={{ color: '#e2e8f0' }}>Post_Date:</strong> Date of post publication</div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                *Original "Engagement_Level" was removed due to inconsistencies and replaced with calculated ERR.
              </p>
            </section>

            {/* Feature Engineering Grid */}
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="#10b981" /> Feature Engineering & Metrics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {/* ERR Card */}
              <div style={{ background: '#172554', padding: '16px', borderRadius: '8px', border: '1px solid #1e40af' }}>
                <h4 style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '8px' }}>ERR% (Engagement Rate by Reach)</h4>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Quantifies engagement relative to reach, enabling fair comparison across posts with different view counts.</p>
                <code style={{ background: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'block', textAlign: 'center' }}>
                  (Likes + Comments + Shares) / Views × 100
                </code>
              </div>

              {/* Decayed ERR Card */}
              <div style={{ background: '#3f1a23', padding: '16px', borderRadius: '8px', border: '1px solid #831843' }}>
                <h4 style={{ color: '#f472b6', fontWeight: 'bold', marginBottom: '8px' }}>Decayed ERR (Time-Weighted)</h4>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>
                  Used by the <strong>AI Strategist</strong>. Applies an exponential penalty to older posts to remove historical bias and highlight current trends.
                </p>
                <code style={{ background: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'block', textAlign: 'center' }}>
                  ERR_original * (e^(-0.003 * age_in_days))
                </code>
              </div>
            </div>

            {/* Grading Scale */}
            <section>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#f59e0b" /> Engagement Grading Scale
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: '#334155', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Low</div>
                  <div style={{ fontWeight: 'bold', color: '#ef4444' }}>0 - 1%</div>
                </div>
                <div style={{ background: '#334155', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Average</div>
                  <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>1 - 3.5%</div>
                </div>
                <div style={{ background: '#334155', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>High</div>
                  <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>3.5 - 6%</div>
                </div>
                <div style={{ background: '#334155', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Excellent</div>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>6%+</div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;