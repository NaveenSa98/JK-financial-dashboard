import { useState, useEffect } from 'react';
import { KEY_EVENTS } from '../../utils/constants';

/**
 * Component that generates annotations for charts based on financial data
 * and significant events
 */
const AnnotationGenerator = ({ 
  data, 
  metricKey = 'revenue',
  threshold = 10, // Percentage threshold for anomaly detection
  onAnnotationsGenerated = null
}) => {
  const [annotations, setAnnotations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate annotations when data changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    generateAnnotations();
  }, [data, metricKey, threshold]);
  
  // Generate annotations based on data and events
  const generateAnnotations = () => {
    setIsGenerating(true);
    
    const generatedAnnotations = [];
    
    // 1. Add annotations for key events
    if (KEY_EVENTS && KEY_EVENTS.length > 0) {
      KEY_EVENTS.forEach(event => {
        const eventYear = parseInt(event.date.substring(0, 4));
        
        // Find corresponding data point
        const dataPoint = data.find(item => item.year === eventYear);
        
        if (dataPoint) {
          generatedAnnotations.push({
            type: 'line',
            scaleID: 'x',
            value: eventYear,
            borderColor: event.impact === 'positive' 
              ? 'rgba(75, 192, 192, 0.7)' 
              : 'rgba(255, 99, 132, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: event.title,
              position: 'start',
              backgroundColor: event.impact === 'positive' 
                ? 'rgba(75, 192, 192, 0.7)' 
                : 'rgba(255, 99, 132, 0.7)',
              color: 'white',
              font: {
                size: 10
              },
              padding: 4
            }
          });
        }
      });
    }
    
    // 2. Add annotations for significant changes in the metric
    if (data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        const currentValue = data[i].financials[metricKey];
        const previousValue = data[i-1].financials[metricKey];
        
        if (!currentValue || !previousValue) continue;
        
        const percentChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
        
        // If change exceeds threshold, add annotation
        if (Math.abs(percentChange) >= threshold) {
          generatedAnnotations.push({
            type: 'point',
            xValue: data[i].year,
            yValue: currentValue,
            backgroundColor: percentChange >= 0 
              ? 'rgba(75, 192, 192, 0.7)' 
              : 'rgba(255, 99, 132, 0.7)',
            borderColor: 'white',
            borderWidth: 2,
            radius: 6,
            label: {
              display: true,
              content: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
              position: percentChange >= 0 ? 'top' : 'bottom',
              backgroundColor: percentChange >= 0 
                ? 'rgba(75, 192, 192, 0.9)' 
                : 'rgba(255, 99, 132, 0.9)',
              color: 'white',
              font: {
                size: 10
              },
              padding: 4
            }
          });
        }
      }
    }
    
    setAnnotations(generatedAnnotations);
    setIsGenerating(false);
    
    // Call callback if provided
    if (onAnnotationsGenerated) {
      onAnnotationsGenerated(generatedAnnotations);
    }
  };
  
  // This component doesn't render anything, it just processes data
  return null;
};

export default AnnotationGenerator;