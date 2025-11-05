import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateEstimatePDF = (traditionalEstimate, aiEstimate) => {
  const doc = new jsPDF();
  
  // Helper for currency formatting
  const formatKES = (value) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      maximumFractionDigits: 2 
    }).format(value);
  };

  // Title
  doc.setFontSize(20);
  doc.text('Construction Cost Estimate Comparison', 20, 20);
  
  // Project Details
  doc.setFontSize(12);
  doc.text(`Project: ${traditionalEstimate.project_name}`, 20, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
  doc.text(`Location: ${traditionalEstimate.location}`, 20, 49);

  // Cost Comparison Table
  doc.autoTable({
    startY: 60,
    head: [['Category', 'Traditional Estimate', 'AI Estimate', 'Difference']],
    body: [
      [
        'Base Cost per sqm',
        formatKES(traditionalEstimate?.calculations?.base_cost_per_sqm || 0),
        formatKES(aiEstimate?.cost_analysis?.base_cost_per_sqm || 0),
        formatKES((aiEstimate?.cost_analysis?.base_cost_per_sqm || 0) - 
                 (traditionalEstimate?.calculations?.base_cost_per_sqm || 0))
      ],
      [
        'Total Cost',
        formatKES(traditionalEstimate?.calculations?.final_total_cost || 0),
        formatKES(aiEstimate?.cost_analysis?.total_cost || 0),
        formatKES((aiEstimate?.cost_analysis?.total_cost || 0) - 
                 (traditionalEstimate?.calculations?.final_total_cost || 0))
      ]
    ],
    theme: 'grid'
  });

  // Materials Breakdown
  if (aiEstimate?.breakdown?.materials?.details) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Materials Breakdown', 20, 20);
    
    const materialsData = aiEstimate.breakdown.materials.details.map(item => [
      item.item,
      formatKES(item.cost),
      `${item.percentage}%`
    ]);

    doc.autoTable({
      startY: 30,
      head: [['Material', 'Cost', 'Percentage']],
      body: materialsData,
      theme: 'striped'
    });
  }

  // Risk Analysis
  if (aiEstimate?.risk_factors?.length) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Risk Analysis', 20, 20);
    
    const riskData = aiEstimate.risk_factors.map(risk => [
      risk.factor,
      risk.severity,
      risk.impact,
      risk.mitigation
    ]);

    doc.autoTable({
      startY: 30,
      head: [['Risk Factor', 'Severity', 'Impact', 'Mitigation Strategy']],
      body: riskData,
      theme: 'striped'
    });
  }

  // Sustainability Metrics
  if (aiEstimate?.sustainability_metrics) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Environmental Impact Assessment', 20, 20);
    
    const metrics = [
      ['Carbon Footprint', `${aiEstimate.sustainability_metrics.carbon_footprint} CO₂e`],
      ['Water Usage', `${aiEstimate.sustainability_metrics.water_usage} m³`],
      ['Renewable Materials', `${aiEstimate.sustainability_metrics.renewable_percentage}%`]
    ];

    doc.autoTable({
      startY: 30,
      head: [['Metric', 'Value']],
      body: metrics,
      theme: 'striped'
    });

    // Sustainability Recommendations
    if (aiEstimate.sustainability_metrics.recommendations.length) {
      doc.setFontSize(14);
      doc.text('Eco-friendly Recommendations:', 20, doc.lastAutoTable.finalY + 20);
      
      let y = doc.lastAutoTable.finalY + 30;
      aiEstimate.sustainability_metrics.recommendations.forEach((rec, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${rec}`, 25, y);
        y += 7;
      });
    }
  }

  // Timeline
  if (aiEstimate?.timeline_impact) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Project Timeline', 20, 20);
    
    const timelineData = aiEstimate.timeline_impact.phases.map(phase => [
      phase.name,
      `${phase.duration} months`,
      `${phase.completion_percentage}%`,
      `${phase.start_date} - ${phase.end_date}`
    ]);

    doc.autoTable({
      startY: 30,
      head: [['Phase', 'Duration', 'Progress', 'Dates']],
      body: timelineData,
      theme: 'striped'
    });
  }

  // Add footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }

  return doc;
};

export const downloadEstimatePDF = (traditionalEstimate, aiEstimate) => {
  const doc = generateEstimatePDF(traditionalEstimate, aiEstimate);
  doc.save(`${traditionalEstimate.project_name}_estimate_comparison.pdf`);
};