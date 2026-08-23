import React from 'react';
import { Section, Callout } from '@/components/content/Blocks';
import { DiagnosticQuiz } from '@/components/interactive/DiagnosticQuiz';

/** Aula: Diagnóstico. */
export function DiagnosticoLesson() {
  return (
    <article className="space-y-8">
      <Section title="Antes de estudar qualquer coisa, descubra o que falta">
        <p>
          &quot;Tenho base ruim em matemática&quot; é uma frase grande demais para ser útil. Ela não
          diz o que estudar, e faz parecer que o buraco é do tamanho de um semestre inteiro.
        </p>
        <p>
          Na prática, quase sempre são <strong>dois ou três pontos específicos</strong> que travam
          tudo. Uma pessoa que erra fração vai travar em escalonamento; quem erra sinal vai errar
          produto escalar. São falhas pontuais, não incapacidade geral.
        </p>
        <p>
          Estas 12 questões localizam exatamente onde está o problema. São 4 áreas, 3 questões cada.
          Cada resposta vem com explicação, então mesmo errando você já aprende algo.
        </p>

        <Callout tipo="info" titulo="Regras do jogo">
          Isto <strong>não é prova</strong>, não vale nota, não fica salvo em lugar nenhum e ninguém
          além de você vê. Errar aqui é literalmente o objetivo — é assim que a gente descobre onde
          atacar. Responda no chute quando não souber; chutar errado também é informação útil.
        </Callout>
      </Section>

      <DiagnosticQuiz />
    </article>
  );
}
