import { Deadline } from '@/types/content';
import { differenceInDays, parseISO } from 'date-fns';

interface DeadlineWidgetProps {
  deadline: Deadline;
}

export function DeadlineWidget({ deadline }: DeadlineWidgetProps) {
  const daysRemaining = differenceInDays(parseISO(deadline.dueDate), new Date());
  const isUrgent = daysRemaining < 7;
  const isOverdue = daysRemaining < 0;

  const getColorClass = () => {
    if (isOverdue) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (isUrgent) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const getTextColorClass = () => {
    if (isOverdue) return 'text-red-800 dark:text-red-200';
    if (isUrgent) return 'text-orange-800 dark:text-orange-200';
    return 'text-green-800 dark:text-green-200';
  };

  return (
    <div className={`p-6 border rounded-lg ${getColorClass()}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`text-lg font-bold ${getTextColorClass()}`}>
            ⏰ {deadline.label}
          </h3>
          <p className={`text-sm mt-2 ${getTextColorClass()}`}>
            {isOverdue ? (
              <>Prazo vencido há {Math.abs(daysRemaining)} dias</>
            ) : (
              <>
                Faltam <strong>{daysRemaining}</strong> dia{daysRemaining !== 1 ? 's' : ''}
              </>
            )}
          </p>
          {deadline.description && (
            <p className={`text-sm mt-2 ${getTextColorClass()}`}>{deadline.description}</p>
          )}
        </div>
        <span className="text-3xl">
          {isOverdue ? '❌' : isUrgent ? '⚠️' : '✅'}
        </span>
      </div>
    </div>
  );
}
