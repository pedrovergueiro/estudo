# Aquisição de imagens e iluminação

Software não recupera informação que a imagem não capturou. A qualidade da inspeção é decidida,
em grande parte, pela estação óptica.

## Estação controlada

- Cubra a estação: luz ambiente variável é a principal fonte de falsos positivos.
- Fixe exposição, ganho, balanço de branco e foco (nada automático). `configs/camera.yaml`.
- Resolução: o menor defeito de interesse deve ocupar **≥ 3–5 px** na imagem que chega ao
  modelo (após o letterbox). Ex.: cápsula de 21,7 mm ocupando 1200 px de uma imagem de 1920 px
  ⇒ 55 px/mm; um furo de 0,1 mm tem 5,5 px na imagem original, mas com `imgsz=640` a escala cai
  3× (640/1920) e ele chega ao modelo com ~1,8 px — abaixo do limite. Use o recorte em 2 estágios
  (`roi.crop_second_stage`: a cápsula recortada ocupa todo o `imgsz`) ou `imgsz` maior, e meça o
  recall de defeitos pequenos.
- Registre a configuração em um perfil (`configs/lighting_profiles.yaml`); o nome e o hash do
  perfil ficam em cada resultado.

## Configurações de iluminação a testar

| Iluminação | Revela | Cuidados |
|---|---|---|
| Domo difuso | manchas, descoloração, partículas, forma geral | reduz reflexos especulares; pode esconder relevo |
| Retroiluminação (painel difuso atrás) | silhueta, furos, lascas, partes ausentes, encaixe; em translúcidas/transparentes, enchimento | perde cor da superfície |
| Lateral rasante (barra em ângulo baixo) | riscos, fissuras, amassados, textura | sombras longas; testar 2 lados |
| Coaxial | superfícies brilhantes planas | pouco útil em superfícies cilíndricas |
| Polarização cruzada (luz + lente) | reduz reflexo especular em gelatina brilhante | reduz luz; ajustar exposição |

Fundo: escolha pelo contraste com o produto — fosco preto para cápsulas claras/transparentes
com luz de topo; cinza médio para bicolores; painel de retroiluminação para silhueta. Não há
configuração única para todas as cores: valide por perfil.

## Cápsulas transparentes e translúcidas

Problemas: reflexo especular, refração, fundo visível através da gelatina, bordas brilhantes.
Estratégia do projeto:

1. **Múltiplas vistas por cápsula** (perfil `transparent_clear`: retroiluminação + lateral +
   difusa). Todas as vistas usam o mesmo `unit_id` no dataset e ficam no mesmo split.
2. **Fusão**: `late_union` (detector em cada vista, união com NMS) é o padrão por não exigir
   modelo especial; `early_channels` (vistas como canais) exige treinar com o mesmo empilhamento —
   experimental. Compare as duas na validação.
3. **Pré-processamento conservador** (`inference/preprocess.py`): campo plano (idealmente com
   imagem de referência do fundo vazio), CLAHE no canal L (clip ≤ 4), bilateral leve. Parâmetros
   agressivos são recusados por código, e um teste garante que um risco de 1 px mantém > 50% do
   contraste após cada perfil.
4. **Reflexos ≠ defeitos**: inclua no treino imagens normais com reflexos, sombras e variações de
   posição (negativos difíceis); a qualidade de imagem (saturação especular > 8%) envia para REVIEW.
5. **Espaços de cor** (`to_lab`, `to_hsv`) e **canais múltiplos** são experimentos controlados:
   só adote se a avaliação mostrar ganho, e treine com a mesma transformação.

## Quando a RGB não basta

Se um defeito não é visível ao olho na imagem adquirida, nenhum modelo vai detectá-lo com
confiabilidade. Registre a limitação (`requires_acquisition` na taxonomia bloqueia PASS quando o
perfil não tem a iluminação necessária) e experimente, medindo: câmera monocromática de maior
resolução, iluminação em comprimento de onda específico (ex.: azul/UV para gelatina, IR para
enchimento), luz estruturada para deformações, ou sensores complementares (pesagem para
enchimento). Imagens RGB não sustentam conclusões sobre contaminação microbiológica, composição
química ou dosagem.

## Controle de iluminação

`capture/base.py` define `LightingController.set_light(step)`. A implementação padrão não aciona
hardware. Para controladores de LED (GPIO, RS-232, Ethernet), implemente a classe, aguarde a
estabilização (`settle_s`) e valide a sincronização imagem↔iluminação antes de usar.
