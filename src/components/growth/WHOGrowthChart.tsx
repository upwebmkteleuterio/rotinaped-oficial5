
import React, { useState, useMemo, useEffect } from 'react';
import { WHO_HEIGHT_DATA } from '../../data/whoHeightData';
import { WHO_WEIGHT_DATA } from '../../data/whoWeightData';
import { WHO_IMC_DATA } from '../../data/whoIMCData';
import { WHO_HEAD_DATA } from '../../data/whoHeadData';
import { Child, Measurement } from '../../types';
import { cn } from '../../lib/utils';

interface WHOGrowthChartProps {
  child: Child;
  measurements: Measurement[];
  metric: 'weight' | 'height' | 'imc' | 'head';
}

type AgeRange = '0-2' | '2-5' | '5-10' | '10-19';

export default function WHOGrowthChart({ child, measurements, metric }: WHOGrowthChartProps) {
  // Logic for WHO standard charts mapping
  const currentAgeInYears = useMemo(() => {
    const birth = new Date(child.birthDate);
    const now = new Date();
    return (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  }, [child.birthDate]);

  const initialRange = useMemo((): AgeRange => {
    if (currentAgeInYears <= 2) return '0-2';
    if (currentAgeInYears <= 5) return '2-5';
    if (currentAgeInYears <= 10) return '5-10';
    return '10-19';
  }, [currentAgeInYears]);

  const [activeRange, setActiveRange] = useState<AgeRange>(initialRange);

  useEffect(() => {
    setActiveRange(initialRange);
  }, [initialRange, child.id]);

  const genderKey = child.gender === 'female' ? 'F' : 'M';
  const isFemale = child.gender === 'female';
  
  const getChartConfig = (range: AgeRange) => {
    if (metric === 'height') {
      return {
        title: range === '0-2' ? 'Comprimento por idade' : 'Estatura por idade',
        subtitle: range === '0-2' ? 'Do nascimento aos 2 anos (escores-z)' : `Dos ${range.split('-')[0]} aos ${range.split('-')[1]} anos (escores-z)`,
        yLabel: range === '0-2' ? 'Comprimento (cm)' : 'Estatura (cm)',
        data: WHO_HEIGHT_DATA[genderKey][range],
        minY: range === '0-2' ? 40 : range === '2-5' ? 75 : range === '5-10' ? 90 : 110,
        maxY: range === '0-2' ? 95 : range === '2-5' ? 125 : range === '5-10' ? 145 : 190,
        yStep: range === '10-19' ? 10 : 5
      };
    } else if (metric === 'weight') {
      const data = WHO_WEIGHT_DATA[genderKey][range];
      return {
        title: 'Peso por idade',
        subtitle: `Dos ${range.split('-')[0]} aos ${range.split('-')[1]} anos`,
        yLabel: 'Peso (kg)',
        data: data,
        minY: range === '0-2' ? 0 : range === '2-5' ? 5 : range === '5-10' ? 10 : 20,
        maxY: range === '0-2' ? 16 : range === '2-5' ? 25 : range === '5-10' ? 45 : 80,
        yStep: 5
      };
    } else if (metric === 'imc') {
      const data = WHO_IMC_DATA[genderKey][range];
      return {
        title: 'IMC por idade',
        subtitle: `Dos ${range.split('-')[0]} aos ${range.split('-')[1]} anos`,
        yLabel: 'IMC (kg/m²)',
        data: data,
        minY: 10,
        maxY: range === '10-19' ? 30 : 25,
        yStep: 5
      };
    } else if (metric === 'head') {
      // Head circumference is usually 0-5
      const validRange = range === '5-10' || range === '10-19' ? '2-5' : range;
      return {
        title: 'Perímetro Cefálico por idade',
        subtitle: range === '0-2' ? 'Do nascimento aos 2 anos (escores-z)' : 'Dos 2 aos 5 anos (escores-z)',
        yLabel: 'Perímetro Cefálico (cm)',
        data: WHO_HEAD_DATA[genderKey][validRange as '0-2' | '2-5'],
        minY: range === '0-2' ? 30 : 40, 
        maxY: range === '0-2' ? 55 : 60, 
        yStep: 5
      };
    }

    return { title: 'Crescimento', subtitle: '', yLabel: '', data: [], minY: 0, maxY: 100, yStep: 10 };
  };

  const internalChartConfigs: Record<AgeRange, any> = {
    '0-2': {
      label: '0 a 2 anos', minAge: 0, maxAge: 2,
      xTicks: [
        { age: 0, label: 'Ao nascer', isMain: true }, { age: 0.5, label: '6m', isMain: false },
        { age: 1, label: '1 ano', isMain: true }, { age: 1.5, label: '1a 6m', isMain: false },
        { age: 2, label: '2 anos', isMain: true },
      ],
      ...getChartConfig('0-2')
    },
    '2-5': {
      label: '2 a 5 anos', minAge: 2, maxAge: 5,
      xTicks: [
        { age: 2, label: '2 anos', isMain: true }, { age: 2.5, label: '2a 6m', isMain: false },
        { age: 3, label: '3 anos', isMain: true }, { age: 3.5, label: '3a 6m', isMain: false },
        { age: 4, label: '4 anos', isMain: true }, { age: 4.5, label: '4a 6m', isMain: false },
        { age: 5, label: '5 anos', isMain: true },
      ],
      ...getChartConfig('2-5')
    },
    '5-10': {
      label: '5 a 10 anos', minAge: 5, maxAge: 10,
      xTicks: Array.from({ length: 6 }, (_, i) => ({ age: i + 5, label: `${i + 5}a`, isMain: true })),
      ...getChartConfig('5-10')
    },
    '10-19': {
      label: '10 a 19 anos', minAge: 10, maxAge: 19,
      xTicks: Array.from({ length: 10 }, (_, i) => ({ age: i + 10, label: `${i + 10}a`, isMain: true })),
      ...getChartConfig('10-19')
    }
  };

  const config = internalChartConfigs[activeRange];

  const userData = useMemo(() => {
    return measurements
      .map(m => {
        const age = (new Date(m.date).getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        let value = 0;
        if (metric === 'height') value = m.height;
        else if (metric === 'weight') value = m.weight;
        else if (metric === 'imc') value = m.imc || 0;
        else if (metric === 'head') value = m.headCircumference || 0;
        return { age, value };
      })
      .filter(d => d.age >= config.minAge && d.age <= config.maxAge && d.value > 0)
      .sort((a, b) => a.age - b.age);
  }, [measurements, child.birthDate, config, metric]);

  const width = 800;
  const height = 500;
  const padding = { top: 30, right: 60, bottom: 60, left: 35 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (age: number) => padding.left + ((age - config.minAge) / (config.maxAge - config.minAge)) * innerWidth;
  const getY = (v: number) => padding.top + innerHeight - ((v - config.minY) / (config.maxY - config.minY)) * innerHeight;

  const isHead = metric === 'head';

  // Paths for areas
  const greenPath = isHead 
    ? [
        `M ${getX(config.data[0].age)},${getY(config.data[0].zPos2)}`,
        ...config.data.map((d: any) => `L ${getX(d.age)},${getY(d.zPos2)}`),
        ...[...config.data].reverse().map((d: any) => `L ${getX(d.age)},${getY(d.zNeg2)}`), 'Z'
      ].join(' ')
    : [
        `M ${getX(config.data[0].age)},${getY(config.maxY)}`,
        ...config.data.map((d: any) => `L ${getX(d.age)},${getY(d.z2)}`),
        `L ${getX(config.data[config.data.length - 1].age)},${getY(config.maxY)}`, 'Z'
      ].join(' ');

  const yellowPath = isHead
    ? [
        `M ${getX(config.data[0].age)},${getY(config.data[0].zNeg2)}`,
        ...config.data.map((d: any) => `L ${getX(d.age)},${getY(d.zNeg2)}`),
        `L ${getX(config.data[config.data.length - 1].age)},${getY(config.minY)}`,
        `L ${getX(config.data[0].age)},${getY(config.minY)}`, 'Z'
      ].join(' ')
    : [
        `M ${getX(config.data[0].age)},${getY(config.data[0].z2)}`,
        ...config.data.map((d: any) => `L ${getX(d.age)},${getY(d.z2)}`),
        ...[...config.data].reverse().map((d: any) => `L ${getX(d.age)},${getY(d.z3)}`), 'Z'
      ].join(' ');

  const redPath = isHead
    ? [
        `M ${getX(config.data[0].age)},${getY(config.maxY)}`,
        ...config.data.map((d: any) => `L ${getX(d.age)},${getY(d.zPos2)}`),
        `L ${getX(config.data[config.data.length - 1].age)},${getY(config.maxY)}`, 'Z'
      ].join(' ')
    : [
        `M ${getX(config.data[0].age)},${getY(config.data[0].z3)}`,
        ...config.data.map((d: any) => `L ${getX(d.age)},${getY(d.z3)}`),
        `L ${getX(config.data[config.data.length - 1].age)},${getY(config.minY)}`,
        `L ${getX(config.data[0].age)},${getY(config.minY)}`, 'Z'
      ].join(' ');

  const z2Line = isHead
    ? config.data.map((d: any, i: number) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)},${getY(d.zPos2)}`).join(' ')
    : config.data.map((d: any, i: number) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)},${getY(d.z2)}`).join(' ');
  
  const z3Line = isHead
    ? config.data.map((d: any, i: number) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)},${getY(d.zNeg2)}`).join(' ')
    : config.data.map((d: any, i: number) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)},${getY(d.z3)}`).join(' ');

  const yTicks = [];
  for (let v = config.minY; v <= config.maxY; v += config.yStep) yTicks.push(v);

  const getDiagnosticLabel = (level: 'adequado' | 'baixo' | 'muito_baixo') => {
    if (metric === 'height') {
      const term = activeRange === '0-2' ? 'Comprimento' : 'Estatura';
      if (level === 'adequado') return `${term} adequado(a) para a idade`;
      if (level === 'baixo') return `Baixo(a) ${term.toLowerCase()} para a idade`;
      if (level === 'muito_baixo') return `Muito baixo(a) ${term.toLowerCase()} para a idade`;
    }
    const isBMI = metric === 'imc';
    if (level === 'adequado') return isBMI ? 'IMC adequado' : 'Peso adequado';
    if (level === 'baixo') return isBMI ? 'Magreza' : 'Baixo peso';
    if (level === 'muito_baixo') return isBMI ? 'Magreza acentuada' : 'Muito baixo peso';
    return '';
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Age Ranges Tabs */}
      <div className={cn(
        "flex overflow-x-auto no-scrollbar gap-3 px-6 py-4 snap-x border-y transition-colors -mx-6",
        isFemale ? "bg-pink-50/80 border-pink-100" : "bg-blue-50/80 border-blue-100"
      )}>
        {(Object.keys(internalChartConfigs) as AgeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setActiveRange(range)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap snap-center shrink-0 border shadow-sm",
              activeRange === range 
                ? (isFemale ? "bg-pink-500 border-pink-500 text-white transform scale-105" : "bg-blue-500 border-blue-500 text-white transform scale-105")
                : (isFemale ? "bg-pink-100 border-pink-200 text-pink-400 hover:bg-pink-200" : "bg-blue-100 border-blue-200 text-blue-400 hover:bg-blue-200")
            )}
          >
            {internalChartConfigs[range].label}
          </button>
        ))}
      </div>

      <div className="px-6 text-center space-y-1">
        <h3 className={cn("text-2xl font-bold transition-colors", isFemale ? "text-pink-500" : "text-blue-500")} style={{ fontFamily: "'Outfit', sans-serif" }}>
          {config.title}
        </h3>
        <p className="text-sm text-slate-500 font-medium">{config.subtitle}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          {isFemale ? 'Sexo Feminino' : 'Sexo Masculino'}
        </p>
      </div>

      {/* The Graph */}
      <div className="relative w-screen -mx-6 bg-white/50 overflow-hidden group border-y border-slate-100 py-6">
        <div className="overflow-x-auto overflow-y-hidden custom-scrollbar-horizontal pb-4">
          <div className="min-w-[800px] h-[400px] px-4">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="font-sans overflow-visible select-none transition-all duration-300">
              {/* Background Surfaces for Areas */}
              <path d={greenPath} fill="#c2ebd3" opacity="0.8" />
              <path d={yellowPath} fill="#fcf4b6" opacity="0.8" />
              <path d={redPath} fill="#f4c2c2" opacity="0.8" />

              {/* Grid lines and Axes */}
              <g stroke="#999" strokeWidth="0.5" opacity="0.4">
                {yTicks.map(v => (
                  <line key={`h-${v}`} x1={padding.left} y1={getY(v)} x2={width - padding.right} y2={getY(v)} />
                ))}
                {config.xTicks.map((tick: any, i: number) => (
                    <line 
                        key={`v-${i}`} 
                        x1={getX(tick.age)} y1={padding.top} 
                        x2={getX(tick.age)} y2={height - padding.bottom} 
                        stroke={tick.isMain ? "#666" : "#ccc"} 
                        strokeDasharray={tick.isMain ? "0" : "4 4"}
                    />
                ))}
              </g>

              {/* WHO Percentile Curves */}
              <path d={z2Line} fill="none" stroke="#000" strokeWidth="2" />
              <path d={z3Line} fill="none" stroke="#000" strokeWidth="1.5" />
              
              <text x={width - padding.right + 5} y={getY(config.data[config.data.length-1][isHead ? 'zPos2' : 'z2']) + 4} fontSize="12" fontWeight="bold">{isHead ? '+2' : '-2'}</text>
              <text x={width - padding.right + 5} y={getY(config.data[config.data.length-1][isHead ? 'zNeg2' : 'z3']) + 4} fontSize="12" fontWeight="bold">{isHead ? '-2' : '-3'}</text>

              {/* Axis Labels and Orientation */}
              <g fill="#333" fontSize="11" textAnchor="middle">
                {/* Y Axis Orientation */}
                <text x={-(innerHeight/2) - padding.top} y={12} transform="rotate(-90)" fontWeight="bold" fontSize="13">
                    {config.yLabel}
                </text>
                
                {yTicks.map(v => (
                   <g key={`ly-${v}`}>
                        <text x={padding.left - 6} y={getY(v) + 4} textAnchor="end">{v}</text>
                        <text x={width - padding.right + 10} y={getY(v) + 4} textAnchor="start">{v}</text>
                   </g>
                ))}

                {/* X Axis Orientation */}
                {config.xTicks.map((tick: any, i: number) => (
                  <text 
                    key={`lx-${i}`} 
                    x={getX(tick.age)} 
                    y={height - padding.bottom + 25} 
                    fontWeight={tick.isMain ? "bold" : "normal"}
                    fontSize={tick.isMain ? "11" : "10"}
                    fill={tick.isMain ? "#333" : "#666"}
                  >
                    {tick.label}
                  </text>
                ))}
              </g>

              {/* User Record Line - Brand color line on top */}
              {userData.length > 0 && (
                <g>
                   <path 
                    d={userData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)},${getY(d.value)}`).join(' ')} 
                    fill="none" 
                    stroke={isFemale ? "#ec4899" : "#2563eb"} 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  {userData.map((d, i) => (
                    <circle 
                      key={`u-${i}`} 
                      cx={getX(d.age)} 
                      cy={getY(d.value)} 
                      r="6" 
                      fill={isFemale ? "#ec4899" : "#2563eb"} 
                      stroke="#fff" 
                      strokeWidth="2" 
                    />
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Diagnostic Legend (Based on user request) */}
      <div className="px-6 pb-6 pt-2 flex flex-col items-center">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm w-full max-w-2xl bg-white">
          <table className="w-full text-[10px] md:text-sm text-center">
            <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="py-2.5 px-4 w-1/2 font-bold tracking-tight uppercase">Valores Críticos</th>
                  <th className="py-2.5 px-4 w-1/2 border-l border-slate-700 font-bold tracking-tight uppercase text-[9px] md:text-xs">Diagnóstico</th>
                </tr>
            </thead>
            <tbody className="text-slate-700 font-bold">
                {isHead ? (
                  <>
                    <tr className="bg-[#f4c2c2]">
                      <td className="py-3 px-4 border-b border-white">&gt; Escore-z +2</td>
                      <td className="py-3 px-4 border-l border-white border-b">Alerta: Macrocefalia (Acima do esperado)</td>
                    </tr>
                    <tr className="bg-[#c2ebd3]">
                      <td className="py-3 px-4 border-b border-white">Entre Escore-z -2 e +2</td>
                      <td className="py-3 px-4 border-l border-white border-b">Perímetro cefálico adequado</td>
                    </tr>
                    <tr className="bg-[#fcf4b6]">
                      <td className="py-3 px-4"> &lt; Escore-z -2</td>
                      <td className="py-3 px-4 border-l border-white">Alerta: Microcefalia (Abaixo do esperado)</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="bg-[#c2ebd3]">
                      <td className="py-3 px-4 border-b border-white">≥ Escore-z -2</td>
                      <td className="py-3 px-4 border-l border-white border-b">{getDiagnosticLabel('adequado')}</td>
                    </tr>
                    <tr className="bg-[#fcf4b6]">
                      <td className="py-3 px-4 border-b border-white leading-tight">≥ Escore-z -3<br className="md:hidden" /> e &lt; Escore-z -2</td>
                      <td className="py-3 px-4 border-l border-white border-b">{getDiagnosticLabel('baixo')}</td>
                    </tr>
                    <tr className="bg-[#f4c2c2]">
                      <td className="py-3 px-4 leading-tight">&lt; Escore-z -3</td>
                      <td className="py-3 px-4 border-l border-white">{getDiagnosticLabel('muito_baixo')}</td>
                    </tr>
                  </>
                )}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-slate-400 mt-4 font-bold uppercase tracking-widest text-center opacity-60">
          Fonte: WHO Child Growth Standards, 2006/2007
        </p>
      </div>
    </div>
  );
}

