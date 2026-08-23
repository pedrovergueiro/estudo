import React from 'react';

/** Blocos de texto reutilizáveis nas aulas. */

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-20">
      <h2 className="mb-4 border-l-4 border-indigo-500 pl-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <div className="space-y-4 text-[16px] leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </section>
  );
}

export function Callout({
  tipo = 'info',
  titulo,
  children,
}: {
  tipo?: 'info' | 'atencao' | 'ia' | 'prova';
  titulo?: string;
  children: React.ReactNode;
}) {
  const estilos = {
    info: {
      box: 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40',
      texto: 'text-blue-900 dark:text-blue-100',
      icone: '💡',
      padrao: 'Sacada',
    },
    atencao: {
      box: 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40',
      texto: 'text-red-900 dark:text-red-100',
      icone: '⚠️',
      padrao: 'Pegadinha comum',
    },
    ia: {
      box: 'border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40',
      texto: 'text-purple-900 dark:text-purple-100',
      icone: '🤖',
      padrao: 'Onde isso aparece em IA',
    },
    prova: {
      box: 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40',
      texto: 'text-amber-900 dark:text-amber-100',
      icone: '📝',
      padrao: 'Cai na prova',
    },
  }[tipo];

  return (
    <div className={`my-5 rounded-lg border-2 p-4 ${estilos.box}`}>
      <div className={`mb-1 text-sm font-bold ${estilos.texto}`}>
        {estilos.icone} {titulo ?? estilos.padrao}
      </div>
      <div className={`text-[15px] leading-relaxed ${estilos.texto}`}>{children}</div>
    </div>
  );
}

export function Checkpoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 p-4">
      <div className="mb-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
        ✅ Até aqui você já sabe
      </div>
      <div className="text-[15px] text-emerald-900 dark:text-emerald-100">{children}</div>
    </div>
  );
}
