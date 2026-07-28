
import { WHO_HEIGHT_DATA } from '../data/whoHeightData';
import { WHO_WEIGHT_DATA } from '../data/whoWeightData';
import { WHO_IMC_DATA } from '../data/whoIMCData';
import { WHO_HEAD_DATA } from '../data/whoHeadData';
import { Child, Measurement } from '../types';

export type GrowthStatus = 'optimal' | 'warning' | 'risk';

interface GrowthAlert {
  metric: string;
  status: GrowthStatus;
  message: string;
  isOutside: boolean;
}

export function calculateGrowthStatus(child: Child, measurements: Measurement[]): GrowthAlert[] {
  if (measurements.length === 0) return [];

  const latest = measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const age = (new Date(latest.date).getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const isFemale = child.gender === 'female';

  const rangeKey = age <= 2 ? '0-2' : age <= 5 ? '2-5' : age <= 10 ? '5-10' : '10-19';

  const getWHOPoint = (data: any, ageValue: number) => {
    const list = data[rangeKey] || data['10-19'] || data['5-10'] || data['0-2'];
    if (!list) return null;
    // Find closest point
    return list.reduce((prev: any, curr: any) => 
      Math.abs(curr.age - ageValue) < Math.abs(prev.age - ageValue) ? curr : prev
    );
  };

  const getAlert = (metricName: string, value: number, whoSource: any, isHeadMetric: boolean = false, isIMCMetric: boolean = false): GrowthAlert => {
    const point = getWHOPoint(whoSource, age);
    if (!point || value <= 0) return { metric: metricName, status: 'optimal', message: '', isOutside: false };

    if (isHeadMetric) {
      // Logic for Head Circumference: Macro (above +2) and Micro (below -2)
      if (value > point.zPos2) {
        return { 
          metric: metricName, status: 'risk', 
          message: `${metricName} acima do esperado (Macrocefalia).`,
          isOutside: true 
        };
      } else if (value < point.zNeg2) {
        return { 
          metric: metricName, status: 'risk', 
          message: `${metricName} abaixo do esperado (Microcefalia).`,
          isOutside: true 
        };
      }
    } else if (isIMCMetric) {
      // IMC (BMI): Upper thresholds are critical for overweight/obesity detection
      if (value >= point.pz3) {
        return {
          metric: metricName, status: 'risk',
          message: `${metricName} muito acima do esperado (Obesidade).`,
          isOutside: true
        };
      } else if (value >= point.pz2) {
        return {
          metric: metricName, status: 'warning',
          message: `${metricName} acima do esperado (Sobrepeso).`,
          isOutside: true
        };
      } else if (value >= point.pz1) {
        return {
          metric: metricName, status: 'optimal',
          message: `${metricName} no limite superior (Risco de sobrepeso).`,
          isOutside: false
        };
      } else if (value < point.z3) {
        return { 
          metric: metricName, status: 'risk', 
          message: `${metricName} muito abaixo do esperado para a idade.`,
          isOutside: true 
        };
      } else if (value < point.z2) {
        return { 
          metric: metricName, status: 'warning', 
          message: `${metricName} abaixo do esperado (Atenção).`,
          isOutside: true 
        };
      }
    } else {
      // Weight and Height: check both directions
      // Upper thresholds: overweight risk
      if (value >= point.pz3) {
        return {
          metric: metricName, status: 'risk',
          message: `${metricName} muito acima do esperado para a idade.`,
          isOutside: true
        };
      } else if (value >= point.pz2) {
        return {
          metric: metricName, status: 'warning',
          message: `${metricName} acima do esperado para a idade.`,
          isOutside: true
        };
      } else
      // Lower thresholds: undernutrition risk
      if (value < point.z3) {
        return { 
          metric: metricName, status: 'risk', 
          message: `${metricName} muito abaixo do esperado para a idade.`,
          isOutside: true 
        };
      } else if (value < point.z2) {
        return { 
          metric: metricName, status: 'warning', 
          message: `${metricName} abaixo do esperado (Atenção).`,
          isOutside: true 
        };
      }
    }

    return { 
      metric: metricName, status: 'optimal', 
      message: `${metricName} dentro da normalidade.`,
      isOutside: false 
    };
  };

  const alerts: GrowthAlert[] = [];
  
  // Height alert
  alerts.push(getAlert('Altura', latest.height, isFemale ? WHO_HEIGHT_DATA.F : WHO_HEIGHT_DATA.M));
  
  // Weight alert
  alerts.push(getAlert('Peso', latest.weight, isFemale ? WHO_WEIGHT_DATA.F : WHO_WEIGHT_DATA.M));
  
  // IMC alert (with IMC-specific thresholds)
  if (latest.imc) {
    alerts.push(getAlert('IMC', latest.imc, isFemale ? WHO_IMC_DATA.F : WHO_IMC_DATA.M, false, true));
  }

  // Head Circ alert
  if (latest.headCircumference) {
    alerts.push(getAlert('Perímetro Cefálico', latest.headCircumference, isFemale ? WHO_HEAD_DATA.F : WHO_HEAD_DATA.M, true));
  }

  return alerts;
}
