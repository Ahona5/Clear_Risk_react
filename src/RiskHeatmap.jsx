import React, { useState, useEffect, useMemo } from 'react';
import './styles/RiskHeatmap.css';

const initialRisks = [
  { id: '1', title: 'Data Breach (Gross)', type: 'G', impact: 5, likelihood: 4, score: 20, level: 'Critical' },
  { id: '2', title: 'Data Breach (Net)', type: 'N', impact: 4, likelihood: 2, score: 8, level: 'Moderate' },
  { id: '3', title: 'System Outage', type: 'G', impact: 4, likelihood: 5, score: 20, level: 'Critical' },
  { id: '4', title: 'Regulatory Fine', type: 'T', impact: 2, likelihood: 2, score: 4, level: 'Low' },
  { id: '5', title: 'Employee Turnover', type: 'G', impact: 2, likelihood: 4, score: 8, level: 'Moderate' },
  { id: '6', title: 'Market Volatility', type: 'G', impact: 3, likelihood: 3, score: 9, level: 'Moderate' },
  { id: '7', title: 'Supply Chain Loss', type: 'G', impact: 4, likelihood: 3, score: 12, level: 'High' },
  { id: '8', title: 'Cloud Connectivity', type: 'N', impact: 3, likelihood: 2, score: 6, level: 'Moderate' },
  { id: '9', title: 'Insider Threat', type: 'G', impact: 5, likelihood: 1, score: 5, level: 'Moderate' },
  { id: '10', title: 'Strategic Rebrand', type: 'T', impact: 1, likelihood: 3, score: 3, level: 'Low' }
];

const RiskHeatmap = () => {
  const [risks, setRisks] = useState(() => {
    const saved = localStorage.getItem('risk-heatmap-standalone-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse risks", e);
      }
    }
    return initialRisks;
  });

  const [draggedRisk, setDraggedRisk] = useState(null);

  useEffect(() => {
    localStorage.setItem('risk-heatmap-standalone-data', JSON.stringify(risks));
  }, [risks]);

  // Ranking System (Auto-ranking by Score Highest -> Lowest)
  const rankedRisks = useMemo(() => {
    return [...risks].sort((a, b) => b.score - a.score).map((risk, index) => ({
      ...risk,
      rank: index + 1
    }));
  }, [risks]);


  const onDragStart = (e, riskId) => {
    setDraggedRisk(riskId);
    e.dataTransfer.setData('text/plain', riskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    setDraggedRisk(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e, targetImpact, targetLikelihood) => {
    e.preventDefault();
    const riskId = e.dataTransfer.getData('text/plain');
    if (!riskId) return;

    setRisks(prev => prev.map(risk => {
      if (risk.id === riskId) {
        const score = targetImpact * targetLikelihood;
        
        let level = 'Low';
        if (score >= 16) level = 'Critical';
        else if (score >= 10) level = 'High';
        else if (score >= 5) level = 'Moderate';
        
        return {
          ...risk,
          impact: targetImpact,
          likelihood: targetLikelihood,
          score,
          level
        };
      }
      return risk;
    }));
    
    setDraggedRisk(null);
  };

  // Color Logic (1-4 Green, 5-9 Yellow, 10-15 Orange, 16-25 Red)
  const getCellColorClass = (score) => {
    if (score >= 16) return 'hm-red';
    if (score >= 10) return 'hm-orange';
    if (score >= 5) return 'hm-yellow';
    return 'hm-green';
  };

  // Badge styles for G, N, T
  const getBadgeClass = (type) => {
    switch(type) {
      case 'G': return 'badge-gross';
      case 'N': return 'badge-net';
      case 'T': return 'badge-target';
      default: return 'badge-gross';
    }
  };

  const impacts = [5, 4, 3, 2, 1];
  const likelihoods = [1, 2, 3, 4, 5];

  return (
    <div className="heatmap-layout">
      {/* LEFT COMPONENT - HEATMAP GRID */}
      <div className="heatmap-container">
        <div className="heatmap-header">
          <h2 className="heatmap-title">Enterprise Risk Heatmap</h2>
          <p className="heatmap-subtitle">Drag and move risks across the assessment matrix</p>
          
          <div className="legend-pills">
            <div className="legend-pill"><span className="badge-gross">G</span> Gross Risk</div>
            <div className="legend-pill"><span className="badge-net">N</span> Net Risk</div>
            <div className="legend-pill"><span className="badge-target">T</span> Target Risk</div>
          </div>
        </div>
        
        <div className="heatmap-grid-wrapper">
          <div className="y-axis-label">Impact</div>
          
          <div className="heatmap-grid" onDragOver={onDragOver}>
            {impacts.map(impact => (
              likelihoods.map(likelihood => {
                const score = impact * likelihood;
                // find risks for this cell and attach rank
                const cellRisks = rankedRisks.filter(r => r.impact === impact && r.likelihood === likelihood);
                
                return (
                  <div 
                    key={`${impact}-${likelihood}`}
                    className={`heatmap-cell ${getCellColorClass(score)}`}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, impact, likelihood)}
                  >
                    <span className="cell-score-bg">{score}</span>
                    
                    {cellRisks.map(risk => (
                      <div
                        key={risk.id}
                        className={`heat-risk-marker ${getBadgeClass(risk.type)} ${draggedRisk === risk.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, risk.id)}
                        onDragEnd={onDragEnd}
                      >
                        {risk.type}
                        {/* Render Rank Badge attached to Marker */}
                        <div className="rank-badge">{risk.rank}</div>
                        
                        <div className="risk-tooltip">
                          <span className="tooltip-title">{risk.title} ({risk.type})</span>
                          <span className="tooltip-detail">Score: {risk.score} ({risk.level})</span>
                          <span className="tooltip-detail">Impact: {risk.impact} | Likelihood: {risk.likelihood}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            ))}
          </div>
          
          <div className="x-axis-label">Likelihood</div>
        </div>
        
        <div className="heatmap-legend">
           <div className="legend-item"><span className="legend-color hm-green"></span> 1-4 (Low)</div>
           <div className="legend-item"><span className="legend-color hm-yellow"></span> 5-9 (Moderate)</div>
           <div className="legend-item"><span className="legend-color hm-orange"></span> 10-15 (High)</div>
           <div className="legend-item"><span className="legend-color hm-red"></span> 16-25 (Critical)</div>
        </div>
      </div>

      {/* RIGHT COMPONENT - AUTO RANKING DASHBOARD */}
      <div className="ranking-container">
        <h3>Risk Rankings</h3>
        <p>Highest severity risks instantly ordered by score</p>
        
        <div className="ranking-list">
          {rankedRisks.map(risk => (
            <div key={risk.id} className="ranking-item">
               <div className="rank-number">#{risk.rank}</div>
               <div className="rank-info">
                 <div className="rank-title-row">
                   <span className="risk-rank-title">{risk.title}</span>
                   <span className={`rank-type-pill ${getBadgeClass(risk.type)}`}>{risk.type} Risk</span>
                 </div>
                 <div className="rank-meta">
                   Score: <strong>{risk.score}</strong> &middot; {risk.level}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default RiskHeatmap;
