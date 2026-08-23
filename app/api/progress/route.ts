import { NextResponse } from 'next/server';
import {
  lerSnapshot,
  registrarTentativa,
  concluirTopico,
  registrarPresenca,
  desbloquearBadges,
  salvarDiagnostico,
  importarDoLocalStorage,
} from '@/lib/db/queries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/progress — estado completo para hidratar a store. */
export async function GET() {
  try {
    return NextResponse.json(lerSnapshot());
  } catch (e) {
    console.error('[api/progress] GET falhou:', e);
    return NextResponse.json({ erro: 'falha ao ler progresso' }, { status: 500 });
  }
}

type Acao =
  | { tipo: 'tentativa'; exerciseId: string; topicId: string; subjectId?: string; correct: boolean; hintsUsed: number; xp: number }
  | { tipo: 'concluir-topico'; topicId: string; subjectId?: string; xp: number }
  | { tipo: 'presenca' }
  | { tipo: 'badges'; ids: string[] }
  | { tipo: 'diagnostico'; acertos: number; total: number; porArea: Record<string, number> }
  | { tipo: 'importar'; snapshot: Record<string, unknown> };

/** POST /api/progress — aplica uma ação e devolve o estado atualizado. */
export async function POST(req: Request) {
  try {
    const acao = (await req.json()) as Acao;

    switch (acao.tipo) {
      case 'tentativa':
        registrarTentativa({
          exerciseId: acao.exerciseId,
          topicId: acao.topicId,
          subjectId: acao.subjectId,
          correct: acao.correct,
          hintsUsed: acao.hintsUsed,
          xp: acao.xp,
        });
        break;

      case 'concluir-topico':
        concluirTopico({ topicId: acao.topicId, subjectId: acao.subjectId, xp: acao.xp });
        break;

      case 'presenca':
        registrarPresenca();
        break;

      case 'badges':
        desbloquearBadges(acao.ids);
        break;

      case 'diagnostico':
        salvarDiagnostico({ acertos: acao.acertos, total: acao.total, porArea: acao.porArea });
        break;

      case 'importar':
        importarDoLocalStorage(acao.snapshot as never);
        break;

      default:
        return NextResponse.json({ erro: 'ação desconhecida' }, { status: 400 });
    }

    // Devolve o estado novo para o cliente não precisar de um segundo request.
    return NextResponse.json(lerSnapshot());
  } catch (e) {
    console.error('[api/progress] POST falhou:', e);
    return NextResponse.json({ erro: 'falha ao gravar progresso' }, { status: 500 });
  }
}
