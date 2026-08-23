import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSimulado, simulados } from '@/lib/content/simulados';
import { SimuladoRunner } from '@/components/simulado/SimuladoRunner';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return simulados.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const s = getSimulado(id);
  return {
    title: s ? `${s.titulo} — Estudo de Matemática` : 'Simulado',
    description: s?.escopoConfirmado ?? '',
  };
}

export default async function SimuladoRunPage({ params }: Props) {
  const { id } = await params;
  const simulado = getSimulado(id);

  if (!simulado) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/simulado"
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Simulados
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {simulado.titulo}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{simulado.livro}</p>

        <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-sm">
          <div className="text-gray-700 dark:text-gray-300">
            <strong>Escopo confirmado:</strong> {simulado.escopoConfirmado}
          </div>
          {simulado.escopoDeclarado && (
            <div className="mt-1 text-amber-700 dark:text-amber-400">
              <strong>Atenção:</strong> {simulado.escopoDeclarado}
            </div>
          )}
        </div>
      </div>

      <SimuladoRunner simulado={simulado} />
    </div>
  );
}
