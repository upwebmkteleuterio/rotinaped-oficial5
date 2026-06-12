
import React from 'react';
import { Child, Measurement } from '../../types';
import { calculateGrowthStatus, GrowthStatus } from '../../lib/growthLogic';
import { AlertCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface HealthStatusCardProps {
  child: Child;
  measurements: Measurement[];
}

export default function HealthStatusCard({ child, measurements }: HealthStatusCardProps) {
  const alerts = calculateGrowthStatus(child, measurements);
  const outsideAlerts = alerts.filter(a => a.isOutside);
  const hasRisk = alerts.some(a => a.status === 'risk');
  const hasWarning = alerts.some(a => a.status === 'warning');

  if (measurements.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
        <Info className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-blue-900 font-bold mb-1">Inicie o acompanhamento</h3>
        <p className="text-blue-700 text-xs leading-relaxed">
          Registre a primeira medição para ver o status de saúde do seu filho comparado aos padrões da OMS.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-all",
        hasRisk ? "bg-red-50 border-red-100" : 
        hasWarning ? "bg-yellow-50 border-yellow-100" : 
        "bg-green-50 border-green-100"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-full shrink-0",
          hasRisk ? "bg-red-500 text-white" : 
          hasWarning ? "bg-yellow-500 text-white" : 
          "bg-green-500 text-white"
        )}>
          {hasRisk || hasWarning ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
        </div>

        <div className="flex-1">
          <h3 className={cn(
            "text-base font-bold mb-1",
            hasRisk ? "text-red-900" : 
            hasWarning ? "text-yellow-900" : 
            "text-green-900"
          )}>
            Saúde hoje
          </h3>
          
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2">
                 <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    alert.status === 'risk' ? "bg-red-500" : 
                    alert.status === 'warning' ? "bg-yellow-500" : 
                    "bg-green-500"
                 )} />
                 <span className={cn(
                    "text-xs",
                    alert.status === 'risk' ? "text-red-700 font-bold" : 
                    alert.status === 'warning' ? "text-yellow-700 font-bold" : 
                    "text-green-700 font-medium"
                 )}>
                    {alert.message || `${alert.metric} dentro do esperado.`}
                 </span>
              </div>
            ))}
          </div>

          {(hasRisk || hasWarning) && (
            <div className="mt-4 pt-3 border-t border-black/5">
                <p className={cn(
                    "text-[10px] leading-relaxed italic",
                    hasRisk ? "text-red-600" : "text-yellow-700"
                )}>
                    *Lembre-se: Estes dados são informativos. Consulte sempre o pediatra para um diagnóstico completo.
                </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
